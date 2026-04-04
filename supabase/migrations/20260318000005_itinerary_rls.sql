-- ================================================================
-- Migration: 20260318000005_itinerary_rls.sql
--
-- Drops all existing RLS policies on itineraries, itinerary_day,
-- and itinerary_items, then recreates them using auth.uid() and
-- the renamed group_id column (was trip_id before migration 04).
--
-- Membership check: group_members WHERE group_id = ... AND user_id = auth.uid()
-- No Clerk JWT patterns; no trip_attendees references.
-- ================================================================


-- ================================================================
-- DROP EXISTING POLICIES
-- (covers names created in 20260318000000 and 20260318000002)
-- ================================================================

-- itineraries
DROP POLICY IF EXISTS "Group members can view itineraries"             ON public.itineraries;
DROP POLICY IF EXISTS "Group members can create itineraries"           ON public.itineraries;
DROP POLICY IF EXISTS "Creator and group admins can update itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Creator and group admins can delete itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Group members can update itineraries"           ON public.itineraries;
DROP POLICY IF EXISTS "Group admins and owner can delete itineraries"  ON public.itineraries;

-- itinerary_day
DROP POLICY IF EXISTS "Group members can view itinerary days"          ON public.itinerary_day;
DROP POLICY IF EXISTS "Group members can add days"                     ON public.itinerary_day;
DROP POLICY IF EXISTS "Group members can update days"                  ON public.itinerary_day;
DROP POLICY IF EXISTS "Group admins can delete days"                   ON public.itinerary_day;
DROP POLICY IF EXISTS "Item creator or admins can delete days"         ON public.itinerary_day;

-- itinerary_items
DROP POLICY IF EXISTS "Group members can view itinerary items"         ON public.itinerary_items;
DROP POLICY IF EXISTS "Group members can add items"                    ON public.itinerary_items;
DROP POLICY IF EXISTS "Item creator and group admins can update items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Item creator and group admins can delete items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Item creator and admins can update items"       ON public.itinerary_items;
DROP POLICY IF EXISTS "Item creator and admins can delete items"       ON public.itinerary_items;


-- ================================================================
-- ITINERARIES
-- ================================================================

CREATE POLICY "Group members can view itineraries"
  ON public.itineraries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = itineraries.group_id
         AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create itineraries"
  ON public.itineraries FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = itineraries.group_id
         AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can update itineraries"
  ON public.itineraries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = itineraries.group_id
         AND gm.user_id = auth.uid()
    )
  );

-- Only owners/admins can delete the group itinerary
CREATE POLICY "Group admins and owners can delete itineraries"
  ON public.itineraries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = itineraries.group_id
         AND gm.user_id = auth.uid()
         AND gm.role IN ('admin'::public.group_member_role, 'owner'::public.group_member_role)
    )
  );


-- ================================================================
-- ITINERARY_DAY
-- Join chain: itinerary_day → itineraries → group_members
-- ================================================================

CREATE POLICY "Group members can view itinerary days"
  ON public.itinerary_day FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i
        JOIN public.group_members gm ON gm.group_id = i.group_id
       WHERE i.id = itinerary_day.itinerary_id
         AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can add days"
  ON public.itinerary_day FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.itineraries i
        JOIN public.group_members gm ON gm.group_id = i.group_id
       WHERE i.id = itinerary_day.itinerary_id
         AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can update days"
  ON public.itinerary_day FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i
        JOIN public.group_members gm ON gm.group_id = i.group_id
       WHERE i.id = itinerary_day.itinerary_id
         AND gm.user_id = auth.uid()
    )
  );

-- Delete guard: admin or owner only (app additionally warns if day has items)
CREATE POLICY "Group admins and owners can delete days"
  ON public.itinerary_day FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i
        JOIN public.group_members gm ON gm.group_id = i.group_id
       WHERE i.id = itinerary_day.itinerary_id
         AND gm.user_id = auth.uid()
         AND gm.role IN ('admin'::public.group_member_role, 'owner'::public.group_member_role)
    )
  );


-- ================================================================
-- ITINERARY_ITEMS
-- Join chain: itinerary_items → itinerary_day → itineraries → group_members
-- ================================================================

CREATE POLICY "Group members can view itinerary items"
  ON public.itinerary_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.itinerary_day d
        JOIN public.itineraries i  ON i.id = d.itinerary_id
        JOIN public.group_members gm ON gm.group_id = i.group_id
       WHERE d.id = itinerary_items.day_id
         AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can add items"
  ON public.itinerary_items FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.itinerary_day d
        JOIN public.itineraries i  ON i.id = d.itinerary_id
        JOIN public.group_members gm ON gm.group_id = i.group_id
       WHERE d.id = itinerary_items.day_id
         AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Item creator and group admins can update items"
  ON public.itinerary_items FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.itinerary_day d
        JOIN public.itineraries i  ON i.id = d.itinerary_id
        JOIN public.group_members gm ON gm.group_id = i.group_id
       WHERE d.id = itinerary_items.day_id
         AND gm.user_id = auth.uid()
         AND gm.role IN ('admin'::public.group_member_role, 'owner'::public.group_member_role)
    )
  );

CREATE POLICY "Item creator and group admins can delete items"
  ON public.itinerary_items FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.itinerary_day d
        JOIN public.itineraries i  ON i.id = d.itinerary_id
        JOIN public.group_members gm ON gm.group_id = i.group_id
       WHERE d.id = itinerary_items.day_id
         AND gm.user_id = auth.uid()
         AND gm.role IN ('admin'::public.group_member_role, 'owner'::public.group_member_role)
    )
  );
