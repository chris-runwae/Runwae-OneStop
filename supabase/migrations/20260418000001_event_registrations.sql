-- supabase/migrations/20260418000001_event_registrations.sql

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id                UUID        NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  user_id                 UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status                  TEXT        NOT NULL DEFAULT 'confirmed'
                            CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  amount_paid             NUMERIC(10,2),
  currency                TEXT,
  stripe_payment_intent   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

DROP TRIGGER IF EXISTS trg_event_registrations_updated_at ON public.event_registrations;
CREATE TRIGGER trg_event_registrations_updated_at
  BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own registrations"
  ON public.event_registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own registrations"
  ON public.event_registrations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own registrations"
  ON public.event_registrations FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Add current_participants counter to events if it doesn't exist yet
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS current_participants INT NOT NULL DEFAULT 0;

-- Auto-update current_participants on events when registration status changes
CREATE OR REPLACE FUNCTION public.sync_event_participant_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed')
     OR (TG_OP = 'UPDATE' AND NEW.status = 'confirmed' AND OLD.status != 'confirmed') THEN
    UPDATE public.events SET current_participants = COALESCE(current_participants, 0) + 1 WHERE id = NEW.event_id;
  ELSIF (TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status = 'confirmed')
     OR (TG_OP = 'DELETE' AND OLD.status = 'confirmed') THEN
    UPDATE public.events
      SET current_participants = GREATEST(COALESCE(current_participants, 1) - 1, 0)
      WHERE id = OLD.event_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_event_registration_count ON public.event_registrations;
CREATE TRIGGER trg_event_registration_count
  AFTER INSERT OR UPDATE OR DELETE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.sync_event_participant_count();
