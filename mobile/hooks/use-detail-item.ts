import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  ADD_ONS_FOR_YOU,
  EXPERIENCE_HIGHLIGHTS,
  FEATURED_ITINERARIES,
  ITINERARIES_FOR_YOU,
} from "@/constants/home.constant";

type DetailType = "itinerary" | "experience";

export function useDetailItem(type: DetailType) {
  const { id } = useLocalSearchParams();

  const item = useMemo(() => {
    if (type === "itinerary") {
      const all = [...ITINERARIES_FOR_YOU, ...FEATURED_ITINERARIES];
      return all.find((i) => i.id === id);
    } else {
      const all = [...ADD_ONS_FOR_YOU, ...EXPERIENCE_HIGHLIGHTS];
      return all.find((i) => i.id === id);
    }
  }, [id, type]);

  return { id, item };
}
