import { Stack } from 'expo-router';
import React from 'react';

export default function CreateTripLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="destination" />
      <Stack.Screen name="days" />
      <Stack.Screen name="details" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
