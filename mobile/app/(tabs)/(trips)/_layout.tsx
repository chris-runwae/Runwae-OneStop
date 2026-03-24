import { Stack } from 'expo-router';
import React from 'react';

export default function TripsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[tripId]/index" />
      <Stack.Screen
        name="[tripId]/add-poll"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: [0.9, 1],
        }}
      />
    </Stack>
  );
}
