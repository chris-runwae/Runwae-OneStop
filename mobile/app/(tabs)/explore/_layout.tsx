import { Stack } from "expo-router";
import React from "react";

export default function ExploreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="itinerary" />
      <Stack.Screen name="experience" />
      <Stack.Screen name="destination" />


    </Stack>
  );
}
