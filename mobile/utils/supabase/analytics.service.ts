import { supabase } from './client';

/** Fire-and-forget view tracker. Never throws — analytics must not break the UI. */
export function trackEventView(eventId: string): void {
  supabase
    .rpc('increment_event_views', { p_event_id: eventId })
    .then(({ error }) => {
      if (error) console.warn('[analytics] trackEventView:', error.message);
    });
}
