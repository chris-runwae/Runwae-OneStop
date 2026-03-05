import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { BricolageGrotesque_400Regular, BricolageGrotesque_500Medium, BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans'; 
import { KeyboardProvider } from "react-native-keyboard-controller";

import { TripsProvider } from '@/context/TripsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from "react-native";

export const unstable_settings = {
  anchor: '(tabs)',
};

function RouteGuard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const segments = useSegments();


  const inAuthGroup = segments[0] === "(auth)";
  const inTabsGroup = segments[0] === "(tabs)";

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else if (!user.onboardingCompleted) {
      if (segments.join("/") !== "(auth)/onboarding") {
        router.replace("/(auth)/onboarding");
      }
    } else {
      if (!inTabsGroup) {
        router.replace("/(tabs)");
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, segments, router]);

  //Change to splash screen
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_400Regular,
    DMSans_700Bold,
    DMSans_600SemiBold,
    DMSans_500Medium,
    DMSans_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <KeyboardProvider>
        <AuthProvider>
          <TripsProvider>
            <StatusBar style="auto" />
            <RouteGuard />
          </TripsProvider>
        </AuthProvider>
      </KeyboardProvider>
    </ThemeProvider>
  );
}
