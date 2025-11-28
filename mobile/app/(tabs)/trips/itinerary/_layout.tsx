import { Stack } from 'expo-router';

export default function ItineraryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Itinerary',
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          animationDuration: 300,
        }}
      />
    </Stack>
  );
}
