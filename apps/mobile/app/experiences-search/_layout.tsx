import { Stack } from 'expo-router';
import React from 'react';

export default function ExperiencesSearchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="results" />
      <Stack.Screen name="detail" />
    </Stack>
  );
}
