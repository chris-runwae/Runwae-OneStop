import { Stack } from 'expo-router';
import React from 'react';

export default function FlightsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="results" />
      <Stack.Screen name="book/review" />
      <Stack.Screen name="book/passengers" />
      <Stack.Screen name="book/payment" />
      <Stack.Screen name="book/confirmation" />
    </Stack>
  );
}
