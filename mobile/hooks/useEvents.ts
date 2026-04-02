import { Event } from "@/types/content.types";
import { getEvents } from "@/utils/supabase/events.service";
import { useCallback, useEffect, useState } from "react";

export function useEvents() {
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await getEvents();
      setData(results);
    } catch (e: any) {
      setError(e.message ?? "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
