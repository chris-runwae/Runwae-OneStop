-- supabase/migrations/20260418000000_add_join_code.sql

CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code  TEXT := '';
  i     INT;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, (floor(random() * length(chars)) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_group_join_code()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.join_code IS NULL THEN
    -- Note: the loop handles the common case (sequential inserts).
    -- Concurrent inserts with the same generated code will be caught by the
    -- unique index (idx_groups_join_code), which will raise a constraint error.
    -- At expected scale (thousands of groups, 32^8 code space), this is acceptable.
    LOOP
      NEW.join_code := public.generate_join_code();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.groups WHERE join_code = NEW.join_code
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS join_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_join_code
  ON public.groups (join_code)
  WHERE join_code IS NOT NULL;

DROP TRIGGER IF EXISTS trg_groups_join_code ON public.groups;
CREATE TRIGGER trg_groups_join_code
  BEFORE INSERT ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.set_group_join_code();

-- Backfill existing rows (each one gets a unique code)
DO $$
DECLARE
  r RECORD;
  new_code TEXT;
BEGIN
  FOR r IN SELECT id FROM public.groups WHERE join_code IS NULL LOOP
    LOOP
      new_code := public.generate_join_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.groups WHERE join_code = new_code);
    END LOOP;
    UPDATE public.groups SET join_code = new_code WHERE id = r.id;
  END LOOP;
END;
$$;

-- SECURITY DEFINER function to look up a group by join_code.
-- This bypasses RLS safely because the caller must supply the exact code.
-- No broad RLS exposure needed.
CREATE OR REPLACE FUNCTION public.get_group_by_join_code(p_code TEXT)
RETURNS TABLE (
  id          UUID,
  name        TEXT,
  description TEXT,
  type        TEXT,
  member_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    g.name,
    g.description,
    g.type,
    COUNT(gm.id) AS member_count
  FROM public.groups g
  LEFT JOIN public.group_members gm ON gm.group_id = g.id
  WHERE g.join_code = upper(p_code)
    AND g.type = 'trip'
  GROUP BY g.id, g.name, g.description, g.type;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_group_by_join_code(TEXT) TO authenticated;
