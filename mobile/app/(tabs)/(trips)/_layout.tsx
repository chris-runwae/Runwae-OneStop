import { Stack } from 'expo-router';
import React from 'react';

export default function TripsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="trip" />
      <Stack.Screen name="[tripId]/index" />
      <Stack.Screen
        name="[tripId]/add-poll"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: [0.9, 1],
        }}
      />
      <Stack.Screen
        name="[tripId]/add-post"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: [0.75, 1],
        }}
      />
      <Stack.Screen
        name="[tripId]/edit"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[tripId]/add-expense"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: [0.9, 1],
        }}
      />
    </Stack>
  );
}
