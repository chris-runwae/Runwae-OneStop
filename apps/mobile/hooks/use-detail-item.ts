import { getDestinationById } from "@/utils/supabase/destinations.service";
import { getExperienceById } from "@/utils/supabase/experiences.service";
import { getItineraryTemplateById } from "@/utils/supabase/itinerary-templates.service";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

type DetailType = "itinerary" | "experience" | "destination";

export function useDetailItem(type: DetailType) {
  const params = useLocalSearchParams<{ id: string }>();
  // Handle case where id might be an array or undefined
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      console.warn(`useDetailItem: No ID found for type ${type}`);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetch = async () => {
      try {
        console.log(`useDetailItem: Fetching ${type} with ID: ${id}`);
        let result: any = null;
        if (type === "itinerary") {
          result = await getItineraryTemplateById(id);
        } else if (type === "experience") {
          result = await getExperienceById(id);
        } else {
          result = await getDestinationById(id);
        }

        if (!cancelled) {
          if (!result) {
            console.log(`useDetailItem: No ${type} found for ID: ${id}`);
          }
          setItem(result);
        }
      } catch (e: any) {
        console.error(`useDetailItem: Error fetching ${type} (${id}):`, e);
        if (!cancelled) setError(e.message ?? "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [id, type]);

  return { id, item, loading, error };
}
