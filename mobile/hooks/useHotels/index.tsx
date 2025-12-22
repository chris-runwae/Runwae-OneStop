import { useCallback, useMemo, useState } from 'react';

import endpoints from '@/services/endpoints/liteApi';
import { Toasts } from '@/utils';

const useHotels = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [tripsHotels, setTripsHotels] = useState<any[]>([]);
  const [hotel, setHotel] = useState<any>(null);
  const [hotelReviews, setHotelReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const options = useMemo(
    () => ({
      method: 'GET' as const,
      headers: {
        accept: 'application/json',
        'X-API-Key': 'sand_283f1436-ff62-4562-8f64-cdefc5605d29',
      },
    }),
    []
  );

  const fetchHotels = async (countryCode?: string, city?: string) => {
    setLoading(true);
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': 'sand_283f1436-ff62-4562-8f64-cdefc5605d29',
      },
    };

    const url = endpoints.getHotelList(countryCode || 'US', city || 'New York');
    const response = await fetch(url, options);
    const data = await response.json();
    setHotels(data);
    setLoading(false);
  };

  const fetchHotelById = useCallback(
    async (id: string) => {
      setLoading(true);
      const url = endpoints.getHotelById(id);
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        setHotel(data?.data);
        setLoading(false);
        return data?.data;
      } catch (error) {
        Toasts.showErrorToast(
          'We could not get the hotel. Please try again later.'
        );
        setError(error as Error);
        setLoading(false);
        return null;
      }
    },
    [options]
  );

  const fetchHotelsByPlaceId = async (placeId: string) => {
    setLoading(true);
    const url = endpoints.getHotelsByPlaceId(placeId);
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      setTripsHotels(data?.data);
      setLoading(false);
      return data?.data;
    } catch (error) {
      Toasts.showErrorToast(
        'We could not get the hotels. Please try again later.'
      );
      setError(error as Error);
      setLoading(false);
      return null;
    }
  };

  const fetchHotelReviews = useCallback(
    async (hotelId: string) => {
      setLoading(true);
      const url = endpoints.getHotelReviews(hotelId);
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log('data ->> ', JSON.stringify(data, null, 2));
        setHotelReviews(data?.data);
        setLoading(false);
        return data?.data;
      } catch (error) {
        Toasts.showErrorToast(
          'We could not get the hotel reviews. Please try again later.'
        );
        setError(error as Error);
      }
    },
    [options]
  );

  return {
    hotels,
    tripsHotels,
    hotel,
    hotelReviews,
    loading,
    error,
    fetchHotels,
    fetchHotelById,
    fetchHotelsByPlaceId,
    fetchHotelReviews,
  };
};

export default useHotels;
