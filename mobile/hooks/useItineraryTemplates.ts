import { ItineraryTemplate } from "@/types/content.types";
import { getItineraryTemplates } from "@/utils/supabase/itinerary-templates.service";
import { useCallback, useEffect, useState } from "react";

export function useItineraryTemplates() {
  const [data, setData] = useState<ItineraryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await getItineraryTemplates();
      setData(results);
    } catch (e: any) {
      setError(e.message ?? "Failed to load itineraries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
