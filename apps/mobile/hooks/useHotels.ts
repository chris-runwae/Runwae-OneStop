import { useCallback, useEffect, useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';

import type { HotelCitySection } from '@/types/hotel.types';
import type { LiteAPIHotelRateItem } from '@/types/liteapi.types';

const POPULAR_CITIES = ['London', 'Paris', 'Dubai', 'New York'];

interface UseHotelsResult {
  data: LiteAPIHotelRateItem[] | HotelCitySection[];
  citySections: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Convex's hotels.search returns DiscoveryItem[]; we adapt to the
// LiteAPIHotelRateItem shape that the mobile HotelCard renders.
// roomTypes/rates aren't in the discovery payload, so the legacy
// fields default to empty — the detail page (which still calls
// api.hotels.getRates) is what populates the rate UI.
function toHotelRateItem(item: any): LiteAPIHotelRateItem {
  return {
    id: item.apiRef,
    name: item.title,
    main_photo: item.imageUrl ?? '',
    thumbnail: item.imageUrl ?? '',
    address: item.locationName ?? '',
    rating: item.rating ?? 0,
    tags: [],
    hotelId: item.apiRef,
    roomTypes: [],
    et: 0,
  };
}

export function useHotels(
  destination: string | null,
  checkin: string,
  checkout: string,
  adults: number,
  _destinationPlaceId: string | null,
): UseHotelsResult {
  const [data, setData] = useState<LiteAPIHotelRateItem[] | HotelCitySection[]>(
    [],
  );
  const [citySections, setCitySections] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHotels = useAction(api.hotels.search);

  const fetchHotels = useCallback(async () => {
    if (!checkin || !checkout) return;
    setLoading(true);
    setError(null);

    try {
      if (destination) {
        const items = await searchHotels({
          term: destination,
          checkin,
          checkout,
          adults,
        });
        setData(items.map(toHotelRateItem));
        setCitySections(false);
      } else {
        const results = await Promise.all(
          POPULAR_CITIES.map((city) =>
            searchHotels({ term: city, checkin, checkout, adults }).then(
              (items) => ({
                city,
                hotels: items.map(toHotelRateItem),
              }),
            ),
          ),
        );
        setData(
          results.filter((s) => s.hotels.length > 0) as unknown as HotelCitySection[],
        );
        setCitySections(true);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  }, [destination, checkin, checkout, adults, searchHotels]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  return { data, citySections, loading, error, refresh: fetchHotels };
}
