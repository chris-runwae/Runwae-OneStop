import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';

import { getSupabaseClient } from '@/lib/supabase';
import { FeaturedTrip, TripAttendeeRole } from '@/types/trips.types';

const useHotels = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchHotels = async (countryCode?: string, city?: string) => {
    setLoading(true);
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': 'sand_283f1436-ff62-4562-8f64-cdefc5605d29',
      },
    };

    fetch(
      'https://api.liteapi.travel/v3.0/data/hotels?countryCode=US&cityName=New%20York',
      options
    )
      .then((res) => res.json())
      .then((res) => setHotels(res))
      .catch((err) => {
        setError(err as Error);
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  return {
    hotels,
    loading,
    error,
    fetchHotels,
  };
};

export default useHotels;
