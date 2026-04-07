import { useCallback, useEffect, useState } from 'react';

import { searchHotelsByCity } from '@/utils/supabase/liteapi.service';
import type { HotelCitySection, HotelSummary } from '@/types/hotel.types';

const POPULAR_CITIES = ['London', 'Paris', 'Dubai', 'New York'];

interface UseHotelsResult {
  data: HotelSummary[] | HotelCitySection[];
  citySections: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useHotels(
  destination: string | null,
  checkin: string,
  checkout: string,
  adults: number
): UseHotelsResult {
  const [data, setData] = useState<HotelSummary[] | HotelCitySection[]>([]);
  const [citySections, setCitySections] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHotels = useCallback(async () => {
    if (!checkin || !checkout) return;
    setLoading(true);
    setError(null);

    try {
      if (destination) {
        // Single destination — flat list
        const hotels = await searchHotelsByCity(
          destination,
          checkin,
          checkout,
          adults
        );
        setData(hotels);
        setCitySections(false);
      } else {
        // No destination — fetch popular cities in parallel
        const results = await Promise.all(
          POPULAR_CITIES.map((city) =>
            searchHotelsByCity(city, checkin, checkout, adults).then(
              (hotels) => ({ city, hotels })
            )
          )
        );
        // Only include sections that returned at least one hotel
        setData(results.filter((s) => s.hotels.length > 0));
        setCitySections(true);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  }, [destination, checkin, checkout, adults]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  return { data, citySections, loading, error, refresh: fetchHotels };
}
