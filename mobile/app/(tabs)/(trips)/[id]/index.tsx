import { useTrips } from '@/context/TripsContext';
import TripDetailScreen from '@/screens/trip/TripDetailScreen';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';

export default function TripDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loadTrip, clearActiveTrip } = useTrips();

  useFocusEffect(
    useCallback(() => {
      if (id) loadTrip(id);
      return () => { clearActiveTrip(); };
    }, [id, loadTrip, clearActiveTrip]),
  );

  return <TripDetailScreen />;
}
