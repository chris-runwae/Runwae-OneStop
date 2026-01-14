import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // or true if you want a header
      }}>
      <Stack.Screen name="index" options={{ title: 'Explore' }} />
    </Stack>
  );
}
