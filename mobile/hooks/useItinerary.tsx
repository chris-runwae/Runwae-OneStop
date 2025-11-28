import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';

import { getSupabaseClient } from '@/lib/supabase';
import {
  CreateItineraryItemInput,
  FeaturedTrip,
  TripAttendeeRole,
} from '@/types/trips.types';

const useItinerary = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [nextTrip, setNextTrip] = useState<any[]>([]);
  const [featuredTrips, setFeaturedTrips] = useState<FeaturedTrip[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useUser();
  const { getToken } = useAuth();

  const addTripItineraryItem = async (
    itineraryItem: CreateItineraryItemInput
  ) => {
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
  };

  return {
    trips,
    nextTrip,
    featuredTrips,
    events,
    loading,
    error,
  };
};

export default useItinerary;
