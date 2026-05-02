-- ================================================================
-- Migration: 20260402000000_content_tables.sql
--
-- Creates content tables for:
--   1. destinations
--   2. experiences  (highlights / add-ons)
--   3. reviews      (shared by experiences + destinations)
--   4. events
--   5. itinerary_templates  (home-screen suggested packages)
-- ================================================================

-- ----------------------------------------------------------------
-- 1. DESTINATIONS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.destinations (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  location     text        NOT NULL,
  image        text,
  rating       numeric(3,2),
  review_count int         NOT NULL DEFAULT 0,
  description  text,
  featured     boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_destinations_updated_at ON public.destinations;
CREATE TRIGGER trg_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ----------------------------------------------------------------
-- 2. EXPERIENCES  (add-ons / highlights)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experiences (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text        NOT NULL,
  category       text,
  rating         numeric(3,2),
  review_count   int         NOT NULL DEFAULT 0,
  description    text,
  image          text,
  gallery        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  price          numeric(10,2),
  featured       boolean     NOT NULL DEFAULT false,
  included       jsonb       NOT NULL DEFAULT '[]'::jsonb,
  what_to_know   jsonb       NOT NULL DEFAULT '[]'::jsonb,
  itinerary      jsonb       NOT NULL DEFAULT '[]'::jsonb,
  destination_id uuid        REFERENCES public.destinations (id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_experiences_updated_at ON public.experiences;
CREATE TRIGGER trg_experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ----------------------------------------------------------------
-- 3. REVIEWS  (shared: experiences + destinations)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text        NOT NULL CHECK (entity_type IN ('experience', 'destination')),
  entity_id   uuid        NOT NULL,
  name        text,
  username    text,
  avatar      text,
  rating      int         CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  review_date text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_entity_idx
  ON public.reviews (entity_type, entity_id);

-- ----------------------------------------------------------------
-- 4. EVENTS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text        NOT NULL,
  location   text,
  date       text,
  time       text,
  category   text,
  image      text,
  latitude   numeric(9,6),
  longitude  numeric(9,6),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ----------------------------------------------------------------
-- 5. ITINERARY_TEMPLATES  (home-screen suggested travel packages)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.itinerary_templates (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text        NOT NULL,
  location         text,
  duration         text,
  category         text,
  image            text,
  rating           numeric(3,2),
  review_count     int         NOT NULL DEFAULT 0,
  activities       int         NOT NULL DEFAULT 0,
  description      text,
  featured         boolean     NOT NULL DEFAULT false,
  included         jsonb       NOT NULL DEFAULT '[]'::jsonb,
  daily_itinerary  jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_itinerary_templates_updated_at ON public.itinerary_templates;
CREATE TRIGGER trg_itinerary_templates_updated_at
  BEFORE UPDATE ON public.itinerary_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ================================================================
-- ROW-LEVEL SECURITY
-- ================================================================

ALTER TABLE public.destinations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_templates  ENABLE ROW LEVEL SECURITY;

-- Public read for all content tables
CREATE POLICY "public read destinations"
  ON public.destinations FOR SELECT USING (true);

CREATE POLICY "public read experiences"
  ON public.experiences FOR SELECT USING (true);

CREATE POLICY "public read reviews"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "public read events"
  ON public.events FOR SELECT USING (true);

CREATE POLICY "public read itinerary_templates"
  ON public.itinerary_templates FOR SELECT USING (true);

-- Authenticated users may write reviews
CREATE POLICY "authenticated insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ================================================================
-- FULL-TEXT SEARCH INDEXES
-- ================================================================

CREATE INDEX IF NOT EXISTS destinations_fts_idx
  ON public.destinations USING gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(location,'')));

CREATE INDEX IF NOT EXISTS experiences_fts_idx
  ON public.experiences USING gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(category,'') || ' ' || coalesce(description,'')));

CREATE INDEX IF NOT EXISTS events_fts_idx
  ON public.events USING gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(location,'') || ' ' || coalesce(category,'')));
