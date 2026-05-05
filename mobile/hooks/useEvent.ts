import { useState, useEffect } from 'react';
import { Event } from '@/types/content.types';
import { 
  getEventById, 
  getEventsByCategory, 
  getEvents 
} from '@/utils/supabase/events.service';

export function useEvent(id: string | string[] | undefined) {
  const [event, setEvent] = useState<Event | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [otherEvents, setOtherEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id || Array.isArray(id)) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const fetchedEvent = await getEventById(id);
        setEvent(fetchedEvent);

        if (fetchedEvent) {
          const [related, all] = await Promise.all([
            getEventsByCategory(fetchedEvent.category),
            getEvents()
          ]);

          setRelatedEvents(related.filter((e) => e.id !== id));
          setOtherEvents(
            all
              .filter((e) => e.id !== id && e.category !== fetchedEvent.category)
              .slice(0, 6)
          );
        }
      } catch (err) {
        console.error("useEvent: Error loading data", err);
        setError(err instanceof Error ? err : new Error('Failed to load event'));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  return {
    event,
    relatedEvents,
    otherEvents,
    loading,
    error,
    refresh: () => {
        // Simple refresh trigger could be added if needed
    }
  };
}
