-- ================================================================
-- Migration: fix_poll_rls
--
-- poll_options and poll_votes policies were referencing
-- trip_attendees and polls.trip_id, but polls uses group_id
-- and the architecture now uses group_members.
-- Also adds a missing DELETE policy on poll_votes so that
-- removeVote and swapVote work.
-- ================================================================

-- ── poll_options ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "View poll options for accessible polls" ON public.poll_options;
DROP POLICY IF EXISTS "Insert options for own polls"           ON public.poll_options;

-- SELECT: group members can view options on polls in their group
CREATE POLICY "View poll options for accessible polls"
  ON public.poll_options FOR SELECT
  USING (EXISTS (
    SELECT 1
      FROM public.polls p
      JOIN public.group_members gm ON gm.group_id = p.group_id
     WHERE p.id       = poll_options.poll_id
       AND gm.user_id = auth.uid()
  ));

-- INSERT: only the poll creator can add options
CREATE POLICY "Insert options for own polls"
  ON public.poll_options FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.polls
     WHERE id         = poll_options.poll_id
       AND created_by = auth.uid()
  ));

-- ── poll_votes ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Trip attendees can view poll votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Trip attendees can vote"            ON public.poll_votes;

-- SELECT: group members can view votes on polls in their group
CREATE POLICY "Group members can view poll votes"
  ON public.poll_votes FOR SELECT
  USING (EXISTS (
    SELECT 1
      FROM public.polls p
      JOIN public.group_members gm ON gm.group_id = p.group_id
     WHERE p.id       = poll_votes.poll_id
       AND gm.user_id = auth.uid()
  ));

-- INSERT: group members can cast their own vote
CREATE POLICY "Group members can vote"
  ON public.poll_votes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
        FROM public.polls p
        JOIN public.group_members gm ON gm.group_id = p.group_id
       WHERE p.id       = poll_votes.poll_id
         AND gm.user_id = auth.uid()
    )
  );

-- DELETE: users can remove their own vote
CREATE POLICY "Users can remove their own vote"
  ON public.poll_votes FOR DELETE
  USING (user_id = auth.uid());
