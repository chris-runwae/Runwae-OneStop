-- ================================================================
-- Migration: 20260318000004_itinerary_schema.sql
--
-- Alters itineraries, itinerary_day, itinerary_items to match
-- the required application schema:
--
--   1. itineraries   : rename trip_id → group_id, drop title +
--                      is_template, add UNIQUE(group_id)
--   2. itinerary_day : make date nullable, add position + updated_at
--   3. itinerary_items: update type CHECK, add currency / notes /
--                       image_url / external_id, rename description→notes
--   4. update_updated_at() trigger function + triggers for
--      itinerary_day and itinerary_items
-- ================================================================

-- ----------------------------------------------------------------
-- update_updated_at — generic trigger function (idempotent)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ================================================================
-- 1. ITINERARIES
-- ================================================================

-- Rename trip_id → group_id for consistency with the rest of the
-- codebase (trips are groups; the FK still points at groups.id).
ALTER TABLE public.itineraries
  RENAME COLUMN trip_id TO group_id;

-- Drop columns that are not needed by the application.
ALTER TABLE public.itineraries
  DROP COLUMN IF EXISTS title,
  DROP COLUMN IF EXISTS is_template;

-- One itinerary per group/trip.
ALTER TABLE public.itineraries
  ADD CONSTRAINT itineraries_group_id_key UNIQUE (group_id);


-- ================================================================
-- 2. ITINERARY_DAY
-- ================================================================

-- date is auto-calculated from trip start_date if available —
-- it is not required at insert time.
ALTER TABLE public.itinerary_day
  ALTER COLUMN date DROP NOT NULL;

-- Explicit ordering within an itinerary.
ALTER TABLE public.itinerary_day
  ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

-- Track last-modified time.
ALTER TABLE public.itinerary_day
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Trigger: keep updated_at current.
DROP TRIGGER IF EXISTS trg_itinerary_day_updated_at ON public.itinerary_day;
CREATE TRIGGER trg_itinerary_day_updated_at
  BEFORE UPDATE ON public.itinerary_day
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ================================================================
-- 3. ITINERARY_ITEMS
-- ================================================================

-- Rename description → notes to align with the hook type.
ALTER TABLE public.itinerary_items
  RENAME COLUMN description TO notes;

-- Widen the type CHECK to include all supported item types.
ALTER TABLE public.itinerary_items
  DROP CONSTRAINT IF EXISTS itinerary_items_type_check;

ALTER TABLE public.itinerary_items
  ADD CONSTRAINT itinerary_items_type_check
  CHECK (type IN (
    'flight', 'hotel', 'activity', 'restaurant',
    'transport', 'cruise', 'event', 'other'
  ));

-- Add missing columns.
ALTER TABLE public.itinerary_items
  ADD COLUMN IF NOT EXISTS currency    text NOT NULL DEFAULT 'GBP',
  ADD COLUMN IF NOT EXISTS image_url   text,
  ADD COLUMN IF NOT EXISTS external_id text;

-- Trigger: keep updated_at current.
DROP TRIGGER IF EXISTS trg_itinerary_items_updated_at ON public.itinerary_items;
CREATE TRIGGER trg_itinerary_items_updated_at
  BEFORE UPDATE ON public.itinerary_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
