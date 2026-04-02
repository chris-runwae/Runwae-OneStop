import { Experience } from "@/types/content.types";
import { getExperiences } from "@/utils/supabase/experiences.service";
import { useCallback, useEffect, useState } from "react";

export function useExperiences() {
  const [data, setData] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await getExperiences();
      setData(results);
    } catch (e: any) {
      setError(e.message ?? "Failed to load experiences");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
