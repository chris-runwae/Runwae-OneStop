import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Alert } from 'react-native';

import { getSupabaseClient } from '@/lib/supabase';
import { FeaturedTrip, TripAttendeeRole } from '@/types/trips.types';

const useTrips = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [nextTrip, setNextTrip] = useState<any[]>([]);
  const [featuredTrips, setFeaturedTrips] = useState<FeaturedTrip[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useUser();
  const { getToken } = useAuth();
  // const supabase = await getSupabaseClient(getToken);

  useEffect(() => {
    if (user) {
      fetchTrips();
      fetchNextTrip();
      fetchEvents();
      fetchFeaturedTrips();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const supabase = await getSupabaseClient(getToken);
      // const { data, error } = await supabase.from('trips').select('*').eq('user_id', user?.id);

      // // Get trips where user is creator OR attendee
      // const { data, error } = await supabase
      //   .from('trips')
      //   .select('*')
      //   .or(
      //     `user_id.eq.${user?.id},id.in.(select trip_id from trip_attendees where user_id.eq.${user?.id})`
      //   );

      // Trips created by user
      const { data: createdTrips, error: createdError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id);

      if (createdError) throw createdError;

      // Trips user is attending
      const { data: attendingTrips, error: attendingError } = await supabase
        .from('trips')
        .select('*')
        .in(
          'id',
          (
            await supabase
              .from('trip_attendees')
              .select('trip_id')
              .eq('user_id', user?.id)
          ).data?.map((row) => row.trip_id) || []
        );

      if (attendingError) throw attendingError;

      // Merge without duplicates
      const allTrips = [...createdTrips, ...attendingTrips].filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i
      );

      if (error) throw error;
      setTrips(allTrips || []);
      setLoading(false);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTripById = async (id: string) => {
    setLoading(true);
    try {
      const supabase = await getSupabaseClient(getToken);
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id);
      if (error) throw error;
      return data;
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNextTrip = async () => {
    setLoading(true);
    try {
      const supabase = await getSupabaseClient(getToken);
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_date', { ascending: true, nullsFirst: false })
        .limit(1);
      if (error) throw error;
      setNextTrip(data || []);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedTrips = async () => {
    setLoading(true);
    try {
      const supabase = await getSupabaseClient(getToken);
      const { data, error } = await supabase.from('featured_trips').select('*');
      if (error) throw error;
      setFeaturedTrips(data || []);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const supabase = await getSupabaseClient(getToken);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user?.id);
      // console.log('Fetching events for user: ', data);
      if (error) throw error;
      setEvents(data || []);
      setLoading(false);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTripAttendees = async (tripId: string) => {
    setLoading(true);
    try {
      const supabase = await getSupabaseClient(getToken);
      const { data, error } = await supabase
        .from('trip_attendees')
        .select('*')
        .eq('trip_id', tripId);
      if (error) throw error;
      return data || [];
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const addTripAttendee = async (
    tripId: string,
    userId: string,
    role: TripAttendeeRole,
    name: string,
    profilePhotoUrl?: string | null
  ) => {
    const supabase = await getSupabaseClient(getToken);
    const { data, error } = await supabase.from('trip_attendees').insert([
      {
        trip_id: tripId,
        user_id: userId,
        role: role || 'member',
        name: name,
        profile_photo_url: profilePhotoUrl || null,
      },
    ]);

    if (error) {
      console.error('Error adding user to trip:', error.message);
      return null;
    }

    return data;
  };

  const getTripItinerary = async (tripId: string) => {
    console.log('Getting trip itinerary for trip: ', tripId);
    setLoading(true);
    try {
      const supabase = await getSupabaseClient(getToken);
      const { data, error } = await supabase
        .from('trip_itinerary')
        .select('*')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: any) => {
    setLoading(true);
    try {
      const supabase = await getSupabaseClient(getToken);

      // 1️⃣ Insert the trip and return the inserted row
      const { data: tripRows, error: createTripError } = await supabase
        .from('trips')
        .insert(tripData)
        .select(); // ensures data is returned

      if (createTripError || !tripRows || tripRows.length === 0) {
        console.log('Error creating trip:', createTripError);
        Alert.alert('Sorry, something went wrong.', 'Please try again.');
        return null;
      }

      const trip = tripRows[0];

      // 2️⃣ Insert the creator into trip_attendees
      const { error: addTripAttendeeError } = await supabase
        .from('trip_attendees')
        .insert([
          {
            trip_id: trip.id,
            user_id: user?.id,
            role: 'owner',
          },
        ]);

      if (addTripAttendeeError) {
        console.log('Error adding trip attendee:', addTripAttendeeError);
        Alert.alert(
          'Trip created but could not add you as an attendee.',
          'Please try again.'
        );
        console.log('addTripAttendeeError: ', addTripAttendeeError); //should probably take this out
      } else {
        console.log('Trip attendee added successfully');
      }

      return trip;
    } catch (error) {
      console.log('Unexpected error:', error);
      setError(error as Error);
      Alert.alert('Unexpected error occurred.', 'Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (tripId: string) => {
    setLoading(true);
    try {
      const supabase = await getSupabaseClient(getToken);

      const { error } = await supabase.rpc('delete_trip_and_attendees', {
        trip_uuid: tripId,
      });

      if (error) {
        console.log('Error deleting trip and attendees:', error);
        Alert.alert('Could not delete trip.', 'Please try again.');
        return false;
      }

      console.log(`Trip ${tripId} and its attendees deleted successfully`);
      return true;
    } catch (error) {
      console.log('Unexpected error deleting trip:', error);
      Alert.alert('Unexpected error occurred.', 'Please try again.');
      return false;
    } finally {
      setLoading(false);
      fetchTrips();
      fetchNextTrip();
    }
  };

  return {
    trips,
    nextTrip,
    featuredTrips,
    events,
    loading,
    error,
    fetchTrips,
    fetchEvents,
    fetchNextTrip,
    fetchFeaturedTrips,
    fetchTripById,
    fetchTripAttendees,
    addTripAttendee,
    getTripItinerary,
    createTrip,
    deleteTrip,
  };
};

export default useTrips;
