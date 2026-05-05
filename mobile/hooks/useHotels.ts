import { useCallback, useEffect, useState } from 'react';

import {
  searchHotelsByCity,
  searchHotelsByCityOrPlaceId,
} from '@/utils/supabase/liteapi.service';
import type { HotelCitySection } from '@/types/hotel.types';
import { LiteAPIHotelRateItem } from '@/types/liteapi.types';

const POPULAR_CITIES = ['London', 'Paris', 'Dubai', 'New York'];

interface UseHotelsResult {
  data: LiteAPIHotelRateItem[] | HotelCitySection[];
  citySections: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useHotels(
  destination: string | null,
  checkin: string,
  checkout: string,
  adults: number,
  destinationPlaceId: string | null
): UseHotelsResult {
  const [data, setData] = useState<LiteAPIHotelRateItem[] | HotelCitySection[]>(
    []
  );
  const [citySections, setCitySections] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHotels = useCallback(async () => {
    if (!checkin || !checkout) return;
    setLoading(true);
    setError(null);

    try {
      if (destination || destinationPlaceId) {
        // Single destination — flat list
        const hotels = await searchHotelsByCityOrPlaceId(
          destination,
          checkin,
          checkout,
          adults,
          destinationPlaceId
        );
        setData(hotels);
        setCitySections(false);
      } else {
        // No destination — fetch popular cities in parallel
        const results = await Promise.all(
          POPULAR_CITIES.map((city) =>
            searchHotelsByCity(
              city,
              checkin,
              checkout,
              adults,
              destinationPlaceId
            ).then((hotels) => ({ city, hotels }))
          )
        );
        // Only include sections that returned at least one hotel
        setData(
          results.filter((s) => s.hotels.length > 0) as HotelCitySection[]
        );
        setCitySections(true);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  }, [destination, checkin, checkout, adults, destinationPlaceId]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  return { data, citySections, loading, error, refresh: fetchHotels };
}
