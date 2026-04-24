-- ================================================================
-- Migration: 20260318000000_trips_section.sql
--
-- Corrections applied:
--   1. Trips are rows in `groups` with type='trip'. All FKs
--      reference public.groups(id) not public.trips(id).
--   2. expense_participants already exists — ALTER TABLE adds
--      is_settled / settled_at. expense_splits not created.
--   3. All RLS policies use group_members / group_member_role.
--      No references to trip_attendees or attendee_role.
--   4. Trigger auto-inserts trip_details on groups INSERT where
--      type='trip' (currency='GBP', visibility='private').
--   5. Storage bucket `groups` created (private, 10MB,
--      jpeg/png/webp). Cover images publicly readable.
--
-- NOTE: Tables must be created before policies that reference them.
--   SQL is structured in 4 phases to respect this ordering.
--
-- Tables ALREADY EXIST (no action): polls, poll_options,
--   poll_votes, expenses, announcements, announcement_reads
-- Tables ALTERED:  expense_participants (+is_settled, +settled_at)
-- Tables CREATED:  groups, group_members, trip_details,
--   saved_itinerary_items, itineraries, itinerary_day,
--   itinerary_items
-- Trigger CREATED: trg_create_trip_details
-- Storage CREATED: bucket `groups`, 3 storage.objects policies
-- ================================================================


-- ================================================================
-- PHASE 1: Enum + Tables (no policies yet)
-- group_members must exist before any policy references it.
-- ================================================================

DO $$ BEGIN
  CREATE TYPE public.group_member_role AS ENUM ('member', 'admin', 'owner');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------------
-- 1. GROUPS
-- Trips are rows with type='trip'; groups with type='group'.
-- trip_id is a self-referential FK: a sub-group linked to a
-- parent trip-group (nullable — groups can exist standalone).
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groups (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text        NOT NULL DEFAULT 'group'
                          CHECK (type IN ('group', 'trip')),
  name        text        NOT NULL,
  description text,
  created_by  text        NOT NULL,
  trip_id     uuid        REFERENCES public.groups(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- 2. GROUP_MEMBERS
-- Unified membership table for both groups and trips.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.group_members (
  id        uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id  uuid                     NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id   text                     NOT NULL,
  role      public.group_member_role NOT NULL DEFAULT 'member',
  joined_at timestamptz              NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- 3. TRIP_DETAILS
-- Extended metadata, 1-to-1 with a groups row of type='trip'.
-- Auto-populated by trigger trg_create_trip_details below.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trip_details (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         uuid        NOT NULL UNIQUE REFERENCES public.groups(id) ON DELETE CASCADE,
  budget          numeric,
  currency        text        NOT NULL DEFAULT 'GBP',
  notes           text,
  cover_image_url text,
  visibility      text        NOT NULL DEFAULT 'private'
                              CHECK (visibility IN ('private', 'invite_only', 'public')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_details ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- 4. EXPENSE_PARTICIPANTS — alter existing table
-- Add settlement tracking. expense_splits NOT created.
-- ----------------------------------------------------------------
ALTER TABLE public.expense_participants
  ADD COLUMN IF NOT EXISTS is_settled boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS settled_at timestamptz;

-- ----------------------------------------------------------------
-- 5. SAVED_ITINERARY_ITEMS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_itinerary_items (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            text        NOT NULL,
  trip_id            uuid        REFERENCES public.groups(id) ON DELETE CASCADE,
  name               text        NOT NULL,
  type               text        CHECK (type IN ('activity', 'restaurant', 'hotel', 'transport', 'other')),
  location           text,
  notes              text,
  external_id        text,       -- ref to external API (hotel, experience, etc.)
  added_to_itinerary boolean     NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_itinerary_items ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- 6. ITINERARIES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.itineraries (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     uuid        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  created_by  text        NOT NULL,
  is_template boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- 7. ITINERARY_DAY
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.itinerary_day (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid        NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  date         date        NOT NULL,
  day_number   integer     NOT NULL,
  title        text,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (itinerary_id, day_number)
);
ALTER TABLE public.itinerary_day ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- 8. ITINERARY_ITEMS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.itinerary_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id      uuid        NOT NULL REFERENCES public.itinerary_day(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  description text,
  type        text        CHECK (type IN ('activity', 'restaurant', 'hotel', 'transport', 'other')),
  start_time  time,
  end_time    time,
  location    text,
  cost        numeric,
  position    integer     NOT NULL DEFAULT 0,
  created_by  text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- PHASE 2: Functions + Trigger
-- group_members now exists so is_group_member can be resolved.
-- plpgsql used (not sql) so body is not validated at create time.
-- ================================================================

-- SECURITY DEFINER helper: avoids infinite recursion when
-- group_members RLS policies would otherwise reference itself.
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
     WHERE group_id = p_group_id
       AND user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
  );
END;
$$;

-- Trigger function: auto-insert trip_details on trip creation.
-- SECURITY DEFINER bypasses RLS on trip_details.
CREATE OR REPLACE FUNCTION public.create_trip_details_on_trip_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.trip_details (trip_id, currency, visibility)
  VALUES (NEW.id, 'GBP', 'private');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_trip_details
  AFTER INSERT ON public.groups
  FOR EACH ROW
  WHEN (NEW.type = 'trip')
  EXECUTE FUNCTION public.create_trip_details_on_trip_insert();


-- ================================================================
-- PHASE 3: RLS Policies
-- All tables and group_members now exist.
-- ================================================================

-- ----------------------------------------------------------------
-- GROUPS
-- ----------------------------------------------------------------
-- SELECT: must be a member
CREATE POLICY "Group members can view groups"
  ON public.groups FOR SELECT
  USING (public.is_group_member(id));

-- INSERT: creator must set themselves as created_by
CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (
    created_by = (current_setting('request.jwt.claims', true)::json ->> 'sub')
  );

-- UPDATE: admin or owner only
CREATE POLICY "Group admins and owners can update groups"
  ON public.groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = groups.id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
         AND gm.role IN ('admin'::group_member_role, 'owner'::group_member_role)
    )
  );

-- DELETE: created_by (owner) only
CREATE POLICY "Group owner can delete group"
  ON public.groups FOR DELETE
  USING (
    created_by = (current_setting('request.jwt.claims', true)::json ->> 'sub')
  );

-- ----------------------------------------------------------------
-- GROUP_MEMBERS
-- ----------------------------------------------------------------
-- SELECT: own row always visible; other members via SECURITY DEFINER
-- (avoids self-referential infinite recursion)
CREATE POLICY "Group members can view all members in their group"
  ON public.group_members FOR SELECT
  USING (
    user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    OR public.is_group_member(group_id)
  );

-- INSERT: self-join always allowed; admins/owners can add others
CREATE POLICY "Group admins can add members; users can self-join"
  ON public.group_members FOR INSERT
  WITH CHECK (
    user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = group_members.group_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
         AND gm.role IN ('admin'::group_member_role, 'owner'::group_member_role)
    )
  );

-- UPDATE: admins/owners can change roles
CREATE POLICY "Group admins can update member roles"
  ON public.group_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = group_members.group_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
         AND gm.role IN ('admin'::group_member_role, 'owner'::group_member_role)
    )
  );

-- DELETE: members can leave; admins/owners can remove others
CREATE POLICY "Members can leave; admins can remove members"
  ON public.group_members FOR DELETE
  USING (
    user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = group_members.group_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
         AND gm.role IN ('admin'::group_member_role, 'owner'::group_member_role)
    )
  );

-- ----------------------------------------------------------------
-- TRIP_DETAILS
-- ----------------------------------------------------------------
CREATE POLICY "Group members can view trip details"
  ON public.trip_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = trip_details.trip_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    )
  );

-- INSERT: admin or owner only (trigger also inserts via SECURITY DEFINER)
CREATE POLICY "Group admins and owners can insert trip details"
  ON public.trip_details FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = trip_details.trip_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
         AND gm.role IN ('admin'::group_member_role, 'owner'::group_member_role)
    )
  );

-- UPDATE: admin or owner only
CREATE POLICY "Group admins and owners can update trip details"
  ON public.trip_details FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = trip_details.trip_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
         AND gm.role IN ('admin'::group_member_role, 'owner'::group_member_role)
    )
  );

-- DELETE: owner only
CREATE POLICY "Group owner can delete trip details"
  ON public.trip_details FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = trip_details.trip_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
         AND gm.role = 'owner'::group_member_role
    )
  );

-- ----------------------------------------------------------------
-- SAVED_ITINERARY_ITEMS
-- ----------------------------------------------------------------
-- SELECT: own items + items shared within a trip-group
CREATE POLICY "Users can view their own and shared trip saved items"
  ON public.saved_itinerary_items FOR SELECT
  USING (
    user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = saved_itinerary_items.trip_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    )
  );

-- INSERT: self-authored; trip_id (if set) must be a group they belong to
CREATE POLICY "Group members can save items to shared trips"
  ON public.saved_itinerary_items FOR INSERT
  WITH CHECK (
    user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    AND (
      trip_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.group_members gm
         WHERE gm.group_id = saved_itinerary_items.trip_id
           AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
      )
    )
  );

-- UPDATE / DELETE: own items only
CREATE POLICY "Users can update their own saved items"
  ON public.saved_itinerary_items FOR UPDATE
  USING (user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

CREATE POLICY "Users can delete their own saved items"
  ON public.saved_itinerary_items FOR DELETE
  USING (user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

-- ----------------------------------------------------------------
-- ITINERARIES
-- ----------------------------------------------------------------
CREATE POLICY "Group members can view itineraries"
  ON public.itineraries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = itineraries.trip_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    )
  );

CREATE POLICY "Group members can create itineraries"
  ON public.itineraries FOR INSERT
  WITH CHECK (
    created_by = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    AND EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = itineraries.trip_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    )
  );

-- UPDATE / DELETE: creator or admin/owner
CREATE POLICY "Creator and group admins can update itineraries"
  ON public.itineraries FOR UPDATE
  USING (
    created_by = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = itineraries.trip_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
         AND gm.role IN ('admin'::group_member_role, 'owner'::group_member_role)
    )
  );

CREATE POLICY "Creator and group admins can delete itineraries"
  ON public.itineraries FOR DELETE
  USING (
    created_by = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = itineraries.trip_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
         AND gm.role IN ('admin'::group_member_role, 'owner'::group_member_role)
    )
  );

-- ----------------------------------------------------------------
-- ITINERARY_DAY
-- RLS chain: itinerary_day → itineraries → group_members
-- ----------------------------------------------------------------
CREATE POLICY "Group members can view itinerary days"
  ON public.itinerary_day FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i
        JOIN public.group_members gm ON gm.group_id = i.trip_id
       WHERE i.id = itinerary_day.itinerary_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    )
  );

CREATE POLICY "Group members can add days"
  ON public.itinerary_day FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.itineraries i
        JOIN public.group_members gm ON gm.group_id = i.trip_id
       WHERE i.id = itinerary_day.itinerary_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    )
  );

CREATE POLICY "Group members can update days"
  ON public.itinerary_day FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i
        JOIN public.group_members gm ON gm.group_id = i.trip_id
       WHERE i.id = itinerary_day.itinerary_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    )
  );

-- DELETE: admin or owner only
CREATE POLICY "Group admins can delete days"
  ON public.itinerary_day FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i
        JOIN public.group_members gm ON gm.group_id = i.trip_id
       WHERE i.id = itinerary_day.itinerary_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
         AND gm.role IN ('admin'::group_member_role, 'owner'::group_member_role)
    )
  );

-- ----------------------------------------------------------------
-- ITINERARY_ITEMS
-- RLS chain: itinerary_items → itinerary_day → itineraries → group_members
-- ----------------------------------------------------------------
CREATE POLICY "Group members can view itinerary items"
  ON public.itinerary_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.itinerary_day d
        JOIN public.itineraries i  ON i.id = d.itinerary_id
        JOIN public.group_members gm ON gm.group_id = i.trip_id
       WHERE d.id = itinerary_items.day_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    )
  );

CREATE POLICY "Group members can add items"
  ON public.itinerary_items FOR INSERT
  WITH CHECK (
    created_by = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    AND EXISTS (
      SELECT 1 FROM public.itinerary_day d
        JOIN public.itineraries i  ON i.id = d.itinerary_id
        JOIN public.group_members gm ON gm.group_id = i.trip_id
       WHERE d.id = itinerary_items.day_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    )
  );

-- UPDATE / DELETE: item creator or group admin/owner
CREATE POLICY "Item creator and group admins can update items"
  ON public.itinerary_items FOR UPDATE
  USING (
    created_by = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    OR EXISTS (
      SELECT 1 FROM public.itinerary_day d
        JOIN public.itineraries i  ON i.id = d.itinerary_id
        JOIN public.group_members gm ON gm.group_id = i.trip_id
       WHERE d.id = itinerary_items.day_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
         AND gm.role IN ('admin'::group_member_role, 'owner'::group_member_role)
    )
  );

CREATE POLICY "Item creator and group admins can delete items"
  ON public.itinerary_items FOR DELETE
  USING (
    created_by = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    OR EXISTS (
      SELECT 1 FROM public.itinerary_day d
        JOIN public.itineraries i  ON i.id = d.itinerary_id
        JOIN public.group_members gm ON gm.group_id = i.trip_id
       WHERE d.id = itinerary_items.day_id
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
         AND gm.role IN ('admin'::group_member_role, 'owner'::group_member_role)
    )
  );


-- ================================================================
-- PHASE 4: Storage
-- Bucket is private; objects served via signed URLs.
-- Cover images ({group_id}/cover.*) are the only public exception.
-- Path convention: {group_id}/{filename}
--   storage.foldername(name) → ARRAY['{group_id}']
--   storage.filename(name)   → '{filename}'
-- ================================================================
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'groups',
  'groups',
  false,                                           -- private; use signed URLs
  ARRAY['image/jpeg', 'image/png', 'image/webp'],
  10485760                                         -- 10 MB
)
ON CONFLICT (id) DO NOTHING;

-- SELECT: anyone (incl. unauthenticated) can read cover images
CREATE POLICY "Public read access for group cover images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'groups'
    AND storage.filename(name) LIKE 'cover.%'
  );

-- INSERT: authenticated group members only
CREATE POLICY "Group members can upload to their group folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'groups'
    AND auth.role() = 'authenticated'
    AND public.is_group_member(
          (storage.foldername(name))[1]::uuid
        )
  );

-- DELETE: group admins and owners only
CREATE POLICY "Group admins can delete from their group folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'groups'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = (storage.foldername(name))[1]::uuid
         AND gm.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')
         AND gm.role IN ('admin'::group_member_role, 'owner'::group_member_role)
    )
  );
