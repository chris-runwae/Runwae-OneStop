import { Event } from '@/types/content.types';
import { getEvents, getEventById } from '@/utils/supabase/events.service';
import { useCallback, useEffect, useState } from 'react';

export function useEvents() {
  const [data, setData] = useState<Event[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await getEvents();
      setData(results);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEventById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const event = await getEventById(id);
      setEvent(event);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, event, loading, error, refresh: fetch, fetchEventById };
}
