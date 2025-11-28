import { Stack } from 'expo-router';

export default function TripsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // or true if you want a header
      }}>
      <Stack.Screen name="index" options={{ title: 'Trips' }} />
      <Stack.Screen name="[id]" options={{ title: 'Trip Details' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="itinerary/modal"
        options={{
          title: 'Create Itinerary',
          presentation: 'modal',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
