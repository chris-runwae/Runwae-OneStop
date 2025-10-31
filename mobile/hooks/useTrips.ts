import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";

import { getSupabaseClient } from "@/lib/supabase";
import { FeaturedTrip } from "@/types/trips.types";

const useTrips = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [nextTrip, setNextTrip] = useState<any[]>([]);
  const [featuredTrips, setFeaturedTrips] = useState<FeaturedTrip[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useUser();
  const { getToken } = useAuth();
  // const supabase = getSupabaseClient(getToken);

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
      const { data, error } = await supabase.from("trips").select("*");
      if (error) throw error;
      setTrips(data || []);
      setLoading(false);
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
        .from("trips")
        .select("*")
        .eq("user_id", user?.id)
        .order("start_date", { ascending: true, nullsFirst: false })
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
      const { data, error } = await supabase.from("featured_trips").select("*");
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
        .from("events")
        .select("*")
        .eq("user_id", user?.id);
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
  };
};

export default useTrips;
