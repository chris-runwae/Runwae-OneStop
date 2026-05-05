import { useState, useEffect, useCallback } from 'react';
import {
  Destination,
  Event,
  Experience,
  ItineraryTemplate,
} from '@/types/content.types';
import { getDestinations } from '@/utils/supabase/destinations.service';
import { getEvents } from '@/utils/supabase/events.service';
import { getExperiences } from '@/utils/supabase/experiences.service';
import { getItineraryTemplates } from '@/utils/supabase/itinerary-templates.service';

interface ExploreData {
  itineraries: ItineraryTemplate[];
  events: Event[];
  experiences: Experience[];
  destinations: Destination[];
}

interface UseExploreDataResult {
  data: ExploreData;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useExploreData = (): UseExploreDataResult => {
  const [data, setData] = useState<ExploreData>({
    itineraries: [],
    events: [],
    experiences: [],
    destinations: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [itineraryData, eventData, experienceData, destinationData] =
        await Promise.all([
          getItineraryTemplates(),
          getEvents(),
          getExperiences(),
          getDestinations(),
        ]);

      setData({
        itineraries: itineraryData,
        events: eventData,
        experiences: experienceData,
        destinations: destinationData,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('useExploreData: Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return { data, loading, refreshing, error, refresh };
};
