import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // or true if you want a header
      }}>
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen
        name="account/account-info"
        options={{ title: 'Account Info' }}
      />
    </Stack>
  );
}
