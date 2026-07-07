import { Stack } from 'expo-router';
import React from 'react';

export default function HotelLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[hotelId]" />
      <Stack.Screen name="book" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="confirmation" />
    </Stack>
  );
}
