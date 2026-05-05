-- supabase/migrations/20260418000002_event_analytics.sql

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_event_views(p_event_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.events SET view_count = view_count + 1 WHERE id = p_event_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_event_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_event_views(UUID) TO anon;
