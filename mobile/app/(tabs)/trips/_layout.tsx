import { Stack } from 'expo-router';

export default function TripsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // or true if you want a header
      }}
    />
  );
}
