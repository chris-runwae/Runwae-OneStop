import { Destination } from "@/types/content.types";
import {
  getDestinations,
} from "@/utils/supabase/destinations.service";
import { useCallback, useEffect, useState } from "react";

export function useDestinations() {
  const [data, setData] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await getDestinations();
      setData(results);
    } catch (e: any) {
      setError(e.message ?? "Failed to load destinations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
