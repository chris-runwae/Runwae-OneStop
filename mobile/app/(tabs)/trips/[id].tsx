// Save as: app/trips/[id].tsx

import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import TripDetailsScreen from '@/screens/trips/TripDetailsScreen';

export default function TripDetailsRoute() {
  const { id } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <TripDetailsScreen tripId={id as string} />
    </>
  );
}
