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
      <Stack.Screen
        name="account/profile-details"
        options={{ title: 'Profile Details' }}
      />
      <Stack.Screen name="security" options={{ title: 'Security' }} />
      <Stack.Screen name="support" options={{ title: 'Support' }} />
    </Stack>
  );
}
