-- ================================================================
-- Migration: fix_rls_auth_uid
--
-- Replaces every occurrence of the Clerk JWT pattern:
--   (current_setting('request.jwt.claims', true)::json ->> 'sub')
-- with the Supabase Auth native function:
--   auth.uid()
--
-- Also converts all user_id / created_by columns from text → uuid
-- so comparisons with auth.uid() are type-safe.
--
-- Steps:
--   1. Drop ALL affected RLS policies
--   2. Truncate tables containing Clerk-format (non-UUID) user IDs
--   3. ALTER columns text → uuid
--   4. Recreate is_group_member() using auth.uid()
--   5. Recreate all policies using auth.uid()
--   6. Recreate storage policies
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Drop ALL affected policies
-- ----------------------------------------------------------------

-- groups
DROP POLICY IF EXISTS "Authenticated users can create groups"      ON public.groups;
DROP POLICY IF EXISTS "Group members can view groups"              ON public.groups;
DROP POLICY IF EXISTS "Group admins and owners can update groups"  ON public.groups;
DROP POLICY IF EXISTS "Group owner can delete group"               ON public.groups;

-- group_members
DROP POLICY IF EXISTS "Group members can view all members in their group" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can add members; users can self-join" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can update member roles"               ON public.group_members;
DROP POLICY IF EXISTS "Members can leave; admins can remove members"       ON public.group_members;

-- trip_details
DROP POLICY IF EXISTS "Group members can view trip details"             ON public.trip_details;
DROP POLICY IF EXISTS "Group admins and owners can insert trip details" ON public.trip_details;
DROP POLICY IF EXISTS "Group admins and owners can update trip details" ON public.trip_details;
DROP POLICY IF EXISTS "Group owner can delete trip details"             ON public.trip_details;

-- saved_itinerary_items
DROP POLICY IF EXISTS "Users can view their own and shared trip saved items" ON public.saved_itinerary_items;
DROP POLICY IF EXISTS "Group members can save items to shared trips"         ON public.saved_itinerary_items;
DROP POLICY IF EXISTS "Users can update their own saved items"               ON public.saved_itinerary_items;
DROP POLICY IF EXISTS "Users can delete their own saved items"               ON public.saved_itinerary_items;

-- itineraries
DROP POLICY IF EXISTS "Group members can view itineraries"              ON public.itineraries;
DROP POLICY IF EXISTS "Group members can create itineraries"            ON public.itineraries;
DROP POLICY IF EXISTS "Creator and group admins can update itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Creator and group admins can delete itineraries" ON public.itineraries;

-- itinerary_day
DROP POLICY IF EXISTS "Group members can view itinerary days" ON public.itinerary_day;
DROP POLICY IF EXISTS "Group members can add days"            ON public.itinerary_day;
DROP POLICY IF EXISTS "Group members can update days"         ON public.itinerary_day;
DROP POLICY IF EXISTS "Group admins can delete days"          ON public.itinerary_day;

-- itinerary_items
DROP POLICY IF EXISTS "Group members can view itinerary items"         ON public.itinerary_items;
DROP POLICY IF EXISTS "Group members can add items"                    ON public.itinerary_items;
DROP POLICY IF EXISTS "Item creator and group admins can update items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Item creator and group admins can delete items" ON public.itinerary_items;

-- expenses
DROP POLICY IF EXISTS "Trip attendees can view expenses"   ON public.expenses;
DROP POLICY IF EXISTS "Trip attendees can create expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses"      ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses"      ON public.expenses;

-- expense_participants
DROP POLICY IF EXISTS "View expense participants for trip expenses"   ON public.expense_participants;
DROP POLICY IF EXISTS "Insert expense participants for own expenses"  ON public.expense_participants;

-- polls
DROP POLICY IF EXISTS "Trip attendees can view polls"        ON public.polls;
DROP POLICY IF EXISTS "Trip attendees can create polls"      ON public.polls;
DROP POLICY IF EXISTS "Poll creators can update their polls" ON public.polls;

-- poll_options
DROP POLICY IF EXISTS "View poll options for accessible polls" ON public.poll_options;
DROP POLICY IF EXISTS "Insert options for own polls"           ON public.poll_options;

-- poll_votes
DROP POLICY IF EXISTS "Trip attendees can view poll votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Trip attendees can vote"            ON public.poll_votes;

-- announcements
DROP POLICY IF EXISTS "Trip attendees can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Trip admins can create announcements"  ON public.announcements;
DROP POLICY IF EXISTS "Announcement creators can update"      ON public.announcements;

-- announcement_reads
DROP POLICY IF EXISTS "Users can view their own reads"       ON public.announcement_reads;
DROP POLICY IF EXISTS "Users can mark announcements as read" ON public.announcement_reads;

-- checklists
DROP POLICY IF EXISTS "Trip attendees can view checklists"   ON public.checklists;
DROP POLICY IF EXISTS "Trip attendees can create checklists" ON public.checklists;
DROP POLICY IF EXISTS "Checklist creators can update"        ON public.checklists;

-- checklist_items
DROP POLICY IF EXISTS "View items for accessible checklists"       ON public.checklist_items;
DROP POLICY IF EXISTS "Trip attendees can add checklist items"     ON public.checklist_items;
DROP POLICY IF EXISTS "Trip attendees can update checklist items"  ON public.checklist_items;

-- trips
DROP POLICY IF EXISTS "Users can view trips"            ON public.trips;
DROP POLICY IF EXISTS "Users can insert their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can modify trips"           ON public.trips;
DROP POLICY IF EXISTS "Users can delete trips"           ON public.trips;

-- trip_collaborators
DROP POLICY IF EXISTS "Users can view trip collaborators"              ON public.trip_collaborators;
DROP POLICY IF EXISTS "Trip owners can add collaborators"              ON public.trip_collaborators;
DROP POLICY IF EXISTS "Users can update their own collaborator status" ON public.trip_collaborators;
DROP POLICY IF EXISTS "Trip owners can remove collaborators"           ON public.trip_collaborators;

-- trip_travelers
DROP POLICY IF EXISTS "Users can view trip travelers"  ON public.trip_travelers;
DROP POLICY IF EXISTS "Trip editors can add travelers" ON public.trip_travelers;
DROP POLICY IF EXISTS "Users can update traveler info" ON public.trip_travelers;
DROP POLICY IF EXISTS "Trip owners can remove travelers" ON public.trip_travelers;

-- trip_attendees
DROP POLICY IF EXISTS "Users can view attendees" ON public.trip_attendees;
DROP POLICY IF EXISTS "Users can join trips"     ON public.trip_attendees;
DROP POLICY IF EXISTS "Users can leave trips"    ON public.trip_attendees;

-- saved_destination_items
DROP POLICY IF EXISTS "Users can view their own saved items" ON public.saved_destination_items;
DROP POLICY IF EXISTS "Users can save items"                 ON public.saved_destination_items;
DROP POLICY IF EXISTS "Users can update their saved items"   ON public.saved_destination_items;
DROP POLICY IF EXISTS "Users can delete their saved items"   ON public.saved_destination_items;

-- destinations
DROP POLICY IF EXISTS "Anyone can view published destinations" ON public.destinations;
DROP POLICY IF EXISTS "Admins can insert destinations"         ON public.destinations;
DROP POLICY IF EXISTS "Admins can update destinations"         ON public.destinations;
DROP POLICY IF EXISTS "Admins can delete destinations"         ON public.destinations;

-- destination_itineraries
DROP POLICY IF EXISTS "Anyone can view published itineraries"       ON public.destination_itineraries;
DROP POLICY IF EXISTS "Admins can manage destination itineraries"   ON public.destination_itineraries;

-- featured_events
DROP POLICY IF EXISTS "Anyone can view published featured events" ON public.featured_events;
DROP POLICY IF EXISTS "Only admin can insert featured events"      ON public.featured_events;
DROP POLICY IF EXISTS "Admin can update featured events"           ON public.featured_events;
DROP POLICY IF EXISTS "Admin can delete featured events"           ON public.featured_events;

-- storage
DROP POLICY IF EXISTS "Group admins can delete from their group folder" ON storage.objects;
DROP POLICY IF EXISTS "Group members can upload to their group folder"  ON storage.objects;

-- ----------------------------------------------------------------
-- 2. Truncate all tables containing Clerk-format user IDs
--    (CASCADE handles FK-dependent child rows automatically)
-- ----------------------------------------------------------------

TRUNCATE
  public.announcement_reads,
  public.announcements,
  public.checklist_items,
  public.checklists,
  public.expense_participants,
  public.expenses,
  public.group_members,
  public.itinerary_items,
  public.itinerary_day,
  public.itineraries,
  public.poll_options,
  public.poll_votes,
  public.polls,
  public.saved_destination_items,
  public.saved_itinerary_items,
  public.trip_attendees,
  public.trip_collaborators,
  public.trip_details,
  public.trip_travelers
CASCADE;

TRUNCATE public.groups CASCADE;
TRUNCATE public.trips  CASCADE;

-- ----------------------------------------------------------------
-- 2b. Drop Clerk-format check constraints before altering columns
-- ----------------------------------------------------------------

ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS user_id_format;

-- ----------------------------------------------------------------
-- 3. ALTER columns text → uuid
-- ----------------------------------------------------------------

ALTER TABLE public.groups
  ALTER COLUMN created_by TYPE uuid USING created_by::uuid;

ALTER TABLE public.group_members
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.itineraries
  ALTER COLUMN created_by TYPE uuid USING created_by::uuid;

ALTER TABLE public.itinerary_items
  ALTER COLUMN created_by TYPE uuid USING created_by::uuid;

ALTER TABLE public.saved_itinerary_items
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.expenses
  ALTER COLUMN created_by TYPE uuid USING created_by::uuid;

ALTER TABLE public.expense_participants
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.polls
  ALTER COLUMN created_by TYPE uuid USING created_by::uuid;

ALTER TABLE public.poll_votes
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.announcements
  ALTER COLUMN created_by TYPE uuid USING created_by::uuid;

ALTER TABLE public.announcement_reads
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.checklists
  ALTER COLUMN created_by TYPE uuid USING created_by::uuid;

ALTER TABLE public.trips
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.trip_collaborators
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.trip_travelers
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.trip_attendees
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.saved_destination_items
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- ----------------------------------------------------------------
-- 4. Recreate is_group_member() using auth.uid()
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.group_members
     WHERE group_id = p_group_id
       AND user_id  = auth.uid()
  );
$$;

-- ----------------------------------------------------------------
-- 5. Recreate all policies using auth.uid()
-- ----------------------------------------------------------------

-- ── groups ──────────────────────────────────────────────────────

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group members can view groups"
  ON public.groups FOR SELECT
  USING (is_group_member(id));

CREATE POLICY "Group admins and owners can update groups"
  ON public.groups FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.group_members gm
     WHERE gm.group_id = groups.id
       AND gm.user_id  = auth.uid()
       AND gm.role IN ('admin','owner')
  ));

CREATE POLICY "Group owner can delete group"
  ON public.groups FOR DELETE
  USING (created_by = auth.uid());

-- ── group_members ────────────────────────────────────────────────

CREATE POLICY "Group members can view all members in their group"
  ON public.group_members FOR SELECT
  USING (user_id = auth.uid() OR is_group_member(group_id));

CREATE POLICY "Group admins can add members; users can self-join"
  ON public.group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = group_members.group_id
         AND gm.user_id  = auth.uid()
         AND gm.role IN ('admin','owner')
    )
  );

CREATE POLICY "Group admins can update member roles"
  ON public.group_members FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.group_members gm
     WHERE gm.group_id = group_members.group_id
       AND gm.user_id  = auth.uid()
       AND gm.role IN ('admin','owner')
  ));

CREATE POLICY "Members can leave; admins can remove members"
  ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = group_members.group_id
         AND gm.user_id  = auth.uid()
         AND gm.role IN ('admin','owner')
    )
  );

-- ── trip_details ─────────────────────────────────────────────────

CREATE POLICY "Group members can view trip details"
  ON public.trip_details FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.group_members gm
     WHERE gm.group_id = trip_details.trip_id
       AND gm.user_id  = auth.uid()
  ));

CREATE POLICY "Group admins and owners can insert trip details"
  ON public.trip_details FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.group_members gm
     WHERE gm.group_id = trip_details.trip_id
       AND gm.user_id  = auth.uid()
       AND gm.role IN ('admin','owner')
  ));

CREATE POLICY "Group admins and owners can update trip details"
  ON public.trip_details FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.group_members gm
     WHERE gm.group_id = trip_details.trip_id
       AND gm.user_id  = auth.uid()
       AND gm.role IN ('admin','owner')
  ));

CREATE POLICY "Group owner can delete trip details"
  ON public.trip_details FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.group_members gm
     WHERE gm.group_id = trip_details.trip_id
       AND gm.user_id  = auth.uid()
       AND gm.role = 'owner'
  ));

-- ── saved_itinerary_items ────────────────────────────────────────

CREATE POLICY "Users can view their own and shared trip saved items"
  ON public.saved_itinerary_items FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = saved_itinerary_items.trip_id
         AND gm.user_id  = auth.uid()
    )
  );

CREATE POLICY "Group members can save items to shared trips"
  ON public.saved_itinerary_items FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      trip_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.group_members gm
         WHERE gm.group_id = saved_itinerary_items.trip_id
           AND gm.user_id  = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own saved items"
  ON public.saved_itinerary_items FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own saved items"
  ON public.saved_itinerary_items FOR DELETE
  USING (user_id = auth.uid());

-- ── itineraries ──────────────────────────────────────────────────

CREATE POLICY "Group members can view itineraries"
  ON public.itineraries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.group_members gm
     WHERE gm.group_id = itineraries.trip_id
       AND gm.user_id  = auth.uid()
  ));

CREATE POLICY "Group members can create itineraries"
  ON public.itineraries FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = itineraries.trip_id
         AND gm.user_id  = auth.uid()
    )
  );

CREATE POLICY "Creator and group admins can update itineraries"
  ON public.itineraries FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = itineraries.trip_id
         AND gm.user_id  = auth.uid()
         AND gm.role IN ('admin','owner')
    )
  );

CREATE POLICY "Creator and group admins can delete itineraries"
  ON public.itineraries FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = itineraries.trip_id
         AND gm.user_id  = auth.uid()
         AND gm.role IN ('admin','owner')
    )
  );

-- ── itinerary_day ────────────────────────────────────────────────

CREATE POLICY "Group members can view itinerary days"
  ON public.itinerary_day FOR SELECT
  USING (EXISTS (
    SELECT 1
      FROM public.itineraries i
      JOIN public.group_members gm ON gm.group_id = i.trip_id
     WHERE i.id       = itinerary_day.itinerary_id
       AND gm.user_id = auth.uid()
  ));

CREATE POLICY "Group members can add days"
  ON public.itinerary_day FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1
      FROM public.itineraries i
      JOIN public.group_members gm ON gm.group_id = i.trip_id
     WHERE i.id       = itinerary_day.itinerary_id
       AND gm.user_id = auth.uid()
  ));

CREATE POLICY "Group members can update days"
  ON public.itinerary_day FOR UPDATE
  USING (EXISTS (
    SELECT 1
      FROM public.itineraries i
      JOIN public.group_members gm ON gm.group_id = i.trip_id
     WHERE i.id       = itinerary_day.itinerary_id
       AND gm.user_id = auth.uid()
  ));

CREATE POLICY "Group admins can delete days"
  ON public.itinerary_day FOR DELETE
  USING (EXISTS (
    SELECT 1
      FROM public.itineraries i
      JOIN public.group_members gm ON gm.group_id = i.trip_id
     WHERE i.id       = itinerary_day.itinerary_id
       AND gm.user_id = auth.uid()
       AND gm.role IN ('admin','owner')
  ));

-- ── itinerary_items ──────────────────────────────────────────────

CREATE POLICY "Group members can view itinerary items"
  ON public.itinerary_items FOR SELECT
  USING (EXISTS (
    SELECT 1
      FROM public.itinerary_day d
      JOIN public.itineraries i    ON i.id        = d.itinerary_id
      JOIN public.group_members gm ON gm.group_id = i.trip_id
     WHERE d.id       = itinerary_items.day_id
       AND gm.user_id = auth.uid()
  ));

CREATE POLICY "Group members can add items"
  ON public.itinerary_items FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1
        FROM public.itinerary_day d
        JOIN public.itineraries i    ON i.id        = d.itinerary_id
        JOIN public.group_members gm ON gm.group_id = i.trip_id
       WHERE d.id       = itinerary_items.day_id
         AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Item creator and group admins can update items"
  ON public.itinerary_items FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1
        FROM public.itinerary_day d
        JOIN public.itineraries i    ON i.id        = d.itinerary_id
        JOIN public.group_members gm ON gm.group_id = i.trip_id
       WHERE d.id       = itinerary_items.day_id
         AND gm.user_id = auth.uid()
         AND gm.role IN ('admin','owner')
    )
  );

CREATE POLICY "Item creator and group admins can delete items"
  ON public.itinerary_items FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1
        FROM public.itinerary_day d
        JOIN public.itineraries i    ON i.id        = d.itinerary_id
        JOIN public.group_members gm ON gm.group_id = i.trip_id
       WHERE d.id       = itinerary_items.day_id
         AND gm.user_id = auth.uid()
         AND gm.role IN ('admin','owner')
    )
  );

-- ── trips ────────────────────────────────────────────────────────

CREATE POLICY "Users can view trips"
  ON public.trips FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own trips"
  ON public.trips FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can modify trips"
  ON public.trips FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete trips"
  ON public.trips FOR DELETE
  USING (user_id = auth.uid());

-- ── trip_collaborators ───────────────────────────────────────────

CREATE POLICY "Users can view trip collaborators"
  ON public.trip_collaborators FOR SELECT
  USING (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR trip_id IN (
      SELECT trip_id FROM public.trip_collaborators tc2
       WHERE tc2.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip owners can add collaborators"
  ON public.trip_collaborators FOR INSERT
  WITH CHECK (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
    OR trip_id IN (
      SELECT trip_id FROM public.trip_collaborators tc2
       WHERE tc2.user_id = auth.uid()
         AND tc2.role = 'owner'
    )
  );

CREATE POLICY "Users can update their own collaborator status"
  ON public.trip_collaborators FOR UPDATE
  USING (
    user_id = auth.uid()
    OR trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Trip owners can remove collaborators"
  ON public.trip_collaborators FOR DELETE
  USING (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

-- ── trip_travelers ───────────────────────────────────────────────

CREATE POLICY "Users can view trip travelers"
  ON public.trip_travelers FOR SELECT
  USING (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR trip_id IN (
      SELECT trip_id FROM public.trip_collaborators
       WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Trip editors can add travelers"
  ON public.trip_travelers FOR INSERT
  WITH CHECK (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
    OR trip_id IN (
      SELECT trip_id FROM public.trip_collaborators
       WHERE user_id = auth.uid()
         AND role IN ('owner','editor')
    )
  );

CREATE POLICY "Users can update traveler info"
  ON public.trip_travelers FOR UPDATE
  USING (
    user_id = auth.uid()
    OR trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Trip owners can remove travelers"
  ON public.trip_travelers FOR DELETE
  USING (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

-- ── trip_attendees ───────────────────────────────────────────────

CREATE POLICY "Users can view attendees"
  ON public.trip_attendees FOR SELECT
  USING (true);

CREATE POLICY "Users can join trips"
  ON public.trip_attendees FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave trips"
  ON public.trip_attendees FOR DELETE
  USING (user_id = auth.uid());

-- ── expenses ─────────────────────────────────────────────────────

CREATE POLICY "Trip attendees can view expenses"
  ON public.expenses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.trip_attendees ta
     WHERE ta.trip_id = expenses.trip_id
       AND ta.user_id = auth.uid()
  ));

CREATE POLICY "Trip attendees can create expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.trip_attendees ta
     WHERE ta.trip_id = expenses.trip_id
       AND ta.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING (created_by = auth.uid());

-- ── expense_participants ─────────────────────────────────────────

CREATE POLICY "View expense participants for trip expenses"
  ON public.expense_participants FOR SELECT
  USING (EXISTS (
    SELECT 1
      FROM public.expenses e
      JOIN public.trip_attendees ta ON ta.trip_id = e.trip_id
     WHERE e.id       = expense_participants.expense_id
       AND ta.user_id = auth.uid()
  ));

CREATE POLICY "Insert expense participants for own expenses"
  ON public.expense_participants FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.expenses
     WHERE id         = expense_participants.expense_id
       AND created_by = auth.uid()
  ));

-- ── polls ────────────────────────────────────────────────────────

CREATE POLICY "Trip attendees can view polls"
  ON public.polls FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.trip_attendees ta
     WHERE ta.trip_id = polls.trip_id
       AND ta.user_id = auth.uid()
  ));

CREATE POLICY "Trip attendees can create polls"
  ON public.polls FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.trip_attendees ta
     WHERE ta.trip_id = polls.trip_id
       AND ta.user_id = auth.uid()
  ));

CREATE POLICY "Poll creators can update their polls"
  ON public.polls FOR UPDATE
  USING (created_by = auth.uid());

-- ── poll_options ─────────────────────────────────────────────────

CREATE POLICY "View poll options for accessible polls"
  ON public.poll_options FOR SELECT
  USING (EXISTS (
    SELECT 1
      FROM public.polls p
      JOIN public.trip_attendees ta ON ta.trip_id = p.trip_id
     WHERE p.id       = poll_options.poll_id
       AND ta.user_id = auth.uid()
  ));

CREATE POLICY "Insert options for own polls"
  ON public.poll_options FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.polls
     WHERE id         = poll_options.poll_id
       AND created_by = auth.uid()
  ));

-- ── poll_votes ───────────────────────────────────────────────────

CREATE POLICY "Trip attendees can view poll votes"
  ON public.poll_votes FOR SELECT
  USING (EXISTS (
    SELECT 1
      FROM public.polls p
      JOIN public.trip_attendees ta ON ta.trip_id = p.trip_id
     WHERE p.id       = poll_votes.poll_id
       AND ta.user_id = auth.uid()
  ));

CREATE POLICY "Trip attendees can vote"
  ON public.poll_votes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
        FROM public.polls p
        JOIN public.trip_attendees ta ON ta.trip_id = p.trip_id
       WHERE p.id       = poll_votes.poll_id
         AND ta.user_id = auth.uid()
    )
  );

-- ── announcements ────────────────────────────────────────────────

CREATE POLICY "Trip attendees can view announcements"
  ON public.announcements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.trip_attendees ta
     WHERE ta.trip_id = announcements.trip_id
       AND ta.user_id = auth.uid()
  ));

CREATE POLICY "Trip admins can create announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.trip_attendees ta
     WHERE ta.trip_id = announcements.trip_id
       AND ta.user_id = auth.uid()
       AND ta.role IN ('admin','owner')
  ));

CREATE POLICY "Announcement creators can update"
  ON public.announcements FOR UPDATE
  USING (created_by = auth.uid());

-- ── announcement_reads ───────────────────────────────────────────

CREATE POLICY "Users can view their own reads"
  ON public.announcement_reads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can mark announcements as read"
  ON public.announcement_reads FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
        FROM public.announcements a
        JOIN public.trip_attendees ta ON ta.trip_id = a.trip_id
       WHERE a.id       = announcement_reads.announcement_id
         AND ta.user_id = auth.uid()
    )
  );

-- ── checklists ───────────────────────────────────────────────────

CREATE POLICY "Trip attendees can view checklists"
  ON public.checklists FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.trip_attendees ta
     WHERE ta.trip_id = checklists.trip_id
       AND ta.user_id = auth.uid()
  ));

CREATE POLICY "Trip attendees can create checklists"
  ON public.checklists FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.trip_attendees ta
     WHERE ta.trip_id = checklists.trip_id
       AND ta.user_id = auth.uid()
  ));

CREATE POLICY "Checklist creators can update"
  ON public.checklists FOR UPDATE
  USING (created_by = auth.uid());

-- ── checklist_items ──────────────────────────────────────────────

CREATE POLICY "View items for accessible checklists"
  ON public.checklist_items FOR SELECT
  USING (EXISTS (
    SELECT 1
      FROM public.checklists c
      JOIN public.trip_attendees ta ON ta.trip_id = c.trip_id
     WHERE c.id       = checklist_items.checklist_id
       AND ta.user_id = auth.uid()
  ));

CREATE POLICY "Trip attendees can add checklist items"
  ON public.checklist_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1
      FROM public.checklists c
      JOIN public.trip_attendees ta ON ta.trip_id = c.trip_id
     WHERE c.id       = checklist_items.checklist_id
       AND ta.user_id = auth.uid()
  ));

CREATE POLICY "Trip attendees can update checklist items"
  ON public.checklist_items FOR UPDATE
  USING (EXISTS (
    SELECT 1
      FROM public.checklists c
      JOIN public.trip_attendees ta ON ta.trip_id = c.trip_id
     WHERE c.id       = checklist_items.checklist_id
       AND ta.user_id = auth.uid()
  ));

-- ── saved_destination_items ──────────────────────────────────────

CREATE POLICY "Users can view their own saved items"
  ON public.saved_destination_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can save items"
  ON public.saved_destination_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their saved items"
  ON public.saved_destination_items FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their saved items"
  ON public.saved_destination_items FOR DELETE
  USING (user_id = auth.uid());

-- ── destinations ─────────────────────────────────────────────────

CREATE POLICY "Anyone can view published destinations"
  ON public.destinations FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can insert destinations"
  ON public.destinations FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'app_role') = 'admin');

CREATE POLICY "Admins can update destinations"
  ON public.destinations FOR UPDATE
  USING ((auth.jwt() ->> 'app_role') = 'admin');

CREATE POLICY "Admins can delete destinations"
  ON public.destinations FOR DELETE
  USING ((auth.jwt() ->> 'app_role') = 'admin');

-- ── destination_itineraries ──────────────────────────────────────

CREATE POLICY "Anyone can view published itineraries"
  ON public.destination_itineraries FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage destination itineraries"
  ON public.destination_itineraries FOR ALL
  USING ((auth.jwt() ->> 'app_role') = 'admin');

-- ── featured_events ──────────────────────────────────────────────

CREATE POLICY "Anyone can view published featured events"
  ON public.featured_events FOR SELECT
  USING (status = 'published');

CREATE POLICY "Only admin can insert featured events"
  ON public.featured_events FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'app_role') = 'admin');

CREATE POLICY "Admin can update featured events"
  ON public.featured_events FOR UPDATE
  USING ((auth.jwt() ->> 'app_role') = 'admin');

CREATE POLICY "Admin can delete featured events"
  ON public.featured_events FOR DELETE
  USING ((auth.jwt() ->> 'app_role') = 'admin');

-- ----------------------------------------------------------------
-- 6. Recreate storage policies
-- ----------------------------------------------------------------

CREATE POLICY "Group admins can delete from their group folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'groups'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.group_members gm
       WHERE gm.group_id = (storage.foldername(objects.name))[1]::uuid
         AND gm.user_id  = auth.uid()
         AND gm.role IN ('admin','owner')
    )
  );

CREATE POLICY "Group members can upload to their group folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'groups'
    AND auth.role() = 'authenticated'
    AND is_group_member((storage.foldername(name))[1]::uuid)
  );
