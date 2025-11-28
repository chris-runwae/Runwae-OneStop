import { useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';

import { getSupabaseClient } from '@/lib/supabase';
import { CreateItineraryItemInput } from '@/types/trips.types';

const useItinerary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { getToken } = useAuth();

  const addTripItineraryItem = async (
    itineraryItem: CreateItineraryItemInput
  ) => {
    setLoading(true);
    try {
      const supabase = await getSupabaseClient(getToken);
      const { data, error } = await supabase.from('trip_attendees').insert([
        {
          ...itineraryItem,
        },
      ]);

      if (error) {
        console.error('Error adding user to trip:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    addTripItineraryItem,
    loading,
    error,
  };
};

export default useItinerary;
