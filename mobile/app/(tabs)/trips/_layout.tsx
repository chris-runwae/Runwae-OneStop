import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TripsLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: 'fitToContents',
        }}
      />
    </Stack>
  );
}
