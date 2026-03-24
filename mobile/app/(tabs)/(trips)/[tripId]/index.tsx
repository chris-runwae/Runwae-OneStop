import { useTrips } from '@/context/TripsContext';
import TripDetailScreen from '@/screens/trip/TripDetailScreen';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';

export default function TripDetailRoute() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { loadTrip, clearActiveTrip } = useTrips();

  useFocusEffect(
    useCallback(() => {
      if (tripId) loadTrip(tripId);
      return () => {
        clearActiveTrip();
      };
    }, [tripId, loadTrip, clearActiveTrip])
  );

  return <TripDetailScreen />;
}
