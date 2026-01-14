import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" options={{ title: 'Explore' }} />
      <Stack.Screen
        name="experiences/index"
        options={{ title: 'Experiences' }}
      />
      <Stack.Screen
        name="experiences/[id]"
        options={{ title: 'Experience Details' }}
      />
      <Stack.Screen
        name="destinations/index"
        options={{ title: 'Destinations' }}
      />
      <Stack.Screen
        name="destinations/[id]"
        options={{ title: 'Destination Details' }}
      />
      <Stack.Screen name="events/index" options={{ title: 'Events' }} />
      <Stack.Screen name="events/[id]" options={{ title: 'Event Details' }} />
      <Stack.Screen
        name="itineraries/index"
        options={{ title: 'Itineraries' }}
      />
      <Stack.Screen
        name="itineraries/[id]"
        options={{ title: 'Itinerary Details' }}
      />
    </Stack>
  );
}
