-- Hotel bookings table
-- Tracks every completed hotel booking, Runwae commission, and optional vendor referral

CREATE TABLE IF NOT EXISTS public.hotel_bookings (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id           UUID        REFERENCES public.groups(id) ON DELETE SET NULL,
  user_id           UUID        REFERENCES auth.users(id)   ON DELETE SET NULL,
  -- nullable: set when booking originated via a vendor referral (future revenue sharing)
  vendor_id         UUID        REFERENCES auth.users(id)   ON DELETE SET NULL,

  -- LiteAPI identifiers
  hotel_id          TEXT        NOT NULL,
  hotel_name        TEXT        NOT NULL,
  booking_ref       TEXT        NOT NULL,          -- LiteAPI bookingId
  confirmation_code TEXT,                          -- hotelConfirmationCode from LiteAPI
  prebook_id        TEXT        NOT NULL,           -- LiteAPI prebookId
  transaction_id    TEXT,                          -- LiteAPI transactionId

  -- Stay details
  checkin           DATE        NOT NULL,
  checkout          DATE        NOT NULL,
  guests            INTEGER     NOT NULL DEFAULT 1,
  room_count        INTEGER     NOT NULL DEFAULT 1,

  -- Financial
  currency          TEXT        NOT NULL DEFAULT 'USD',
  total_amount      NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2),                -- from LiteAPI prebook response

  -- Booking metadata
  booking_type      TEXT        NOT NULL DEFAULT 'individual'
                    CHECK (booking_type IN ('individual', 'group')),
  status            TEXT        NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('pending', 'confirmed', 'cancelled')),

  -- Full LiteAPI response stored for debugging / future use
  raw_response      JSONB,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.hotel_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own hotel bookings"
  ON public.hotel_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hotel bookings"
  ON public.hotel_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at (reuses the handle_updated_at trigger already defined)
CREATE TRIGGER set_hotel_bookings_updated_at
  BEFORE UPDATE ON public.hotel_bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
