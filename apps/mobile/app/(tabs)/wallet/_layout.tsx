import { Stack } from 'expo-router';

export default function WalletLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="link-card" options={{ presentation: 'modal' }} />
      <Stack.Screen name="merchant/[id]" />
      <Stack.Screen name="activity" />
    </Stack>
  );
}
