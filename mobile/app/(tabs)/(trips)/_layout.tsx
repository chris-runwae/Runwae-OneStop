import { Stack } from "expo-router";
import React from "react";

export default function TripsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create/destination" />
      <Stack.Screen name="[id]/index" />
    </Stack>
  );
}
