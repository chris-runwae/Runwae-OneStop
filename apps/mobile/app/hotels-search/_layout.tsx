import { Stack } from 'expo-router';
import React from 'react';

export default function HotelsSearchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="results" />
      <Stack.Screen name="hotel" />
    </Stack>
  );
}
