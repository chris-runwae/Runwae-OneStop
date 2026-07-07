import { Stack } from 'expo-router';
import { AppFonts } from '@/constants';

// Home lives in its own Stack so the screen has a native header/toolbar
// host. NativeTabs never render headers, so without this Stack the
// `Stack.Toolbar` on the Home screen has nothing to attach to and stays
// invisible. Mirrors the (trips) and profile tabs, which already nest a
// Stack for the same reason.
export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitleStyle: {
          fontFamily: AppFonts.bricolage.bold,
        },
        headerLargeTitleStyle: {
          fontFamily: AppFonts.bricolage.bold,
          fontSize: 32,
        },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}
