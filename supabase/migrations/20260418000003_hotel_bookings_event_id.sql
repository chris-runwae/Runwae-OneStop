-- supabase/migrations/20260418000003_hotel_bookings_event_id.sql

ALTER TABLE public.hotel_bookings
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_hotel_bookings_event_id
  ON public.hotel_bookings (event_id)
  WHERE event_id IS NOT NULL;

COMMENT ON COLUMN public.hotel_bookings.event_id IS
  'The event that originated this booking (vendor attribution and commission tracking).';
