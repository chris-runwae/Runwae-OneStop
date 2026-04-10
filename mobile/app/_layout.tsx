import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import ToastManager from 'toastify-react-native';

import SplashScreen from '@/components/ui/splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TripsProvider } from '@/context/TripsContext';
import { useColorScheme } from 'nativewind';
import { getThemePreference } from '@/utils/storage';
import '../global.css';

function RouteGuard() {
  const segments = useSegments();
  const {
    isLoading,
    hasSeenOnboarding,
    hasCompletedBoarding,
    currentBoardingStep,
    isAuthenticated,
    initialize,
  } = useAuth();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  const AUTH_ROUTES = new Set([
    '(auth)',
    'login',
    'signup',
    'register',
    'forgot-password',
    'check-email',
    'reset-password',
    'onboarding',
    'onboarding-steps',
  ]);

  const ONBOARDING_STEPS = new Set(['onboarding', 'onboarding-steps']);

  const BOARDING_STEPS = new Set([
    'boarding',
    'step-1',
    'step-2',
    'step-3',
    'step-4',
  ]);

  const AUTHORIZED_ROOT_ROUTES = new Set([
    '(tabs)',
    'notifications',
    'modal',
    'itinerary',
    'experience',
    'create-trip',
    'events',
    'search',
    'hotels',
  ]);

  const [currentSegment, secondSegment] = segments as string[];
  const isInAuthFlow =
    AUTH_ROUTES.has(currentSegment) ||
    (currentSegment === '(auth)' &&
      secondSegment &&
      AUTH_ROUTES.has(secondSegment));
  const isInOnboardingSteps =
    currentSegment === '(auth)' &&
    secondSegment &&
    ONBOARDING_STEPS.has(secondSegment);
  const isInBoardingSteps =
    currentSegment === 'boarding' &&
    secondSegment &&
    BOARDING_STEPS.has(secondSegment);
  const isInTabs = currentSegment === '(tabs)';
  const isInOnboarding = currentSegment === 'onboarding';
  const isInAuthorizedRoot = [
    undefined,
    '(tabs)',
    'notifications',
    'modal',
    'itinerary',
    'experience',
    'destination',
    'create-trip',
    'events',
    'search',
    'hotel',
    'hotels',
  ].includes(currentSegment as any);

  // Redirection Logic
  if (!isAuthenticated && !isInAuthFlow) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (
    isAuthenticated &&
    !hasCompletedBoarding &&
    !isInAuthorizedRoot &&
    !isInBoardingSteps
  ) {
    return <Redirect href={`/boarding/step-${currentBoardingStep}` as any} />;
  }

  if (isAuthenticated && !isInAuthorizedRoot && !isInBoardingSteps) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="boarding" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="create-trip" options={{ headerShown: false }} />
      <Stack.Screen name="itinerary" options={{ headerShown: false }} />
      <Stack.Screen name="experience" options={{ headerShown: false }} />
      <Stack.Screen name="destination" options={{ headerShown: false }} />
      <Stack.Screen name="events" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="hotel" options={{ headerShown: false }} />
      <Stack.Screen name="hotels" options={{ headerShown: false }} />
      <Stack.Screen name="itinerary/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="experience/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: 'modal', headerShown: true, title: 'Modal' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    async function loadTheme() {
      const storedTheme = await getThemePreference();
      if (storedTheme) {
        setColorScheme(storedTheme);
      }
    }
    loadTheme();
  }, [setColorScheme]);
  const [fontsLoaded] = useFonts({
    'BricolageGrotesque-Regular': require('../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-Regular.ttf'),
    'BricolageGrotesque-Medium': require('../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-Medium.ttf'),
    'BricolageGrotesque-SemiBold': require('../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-SemiBold.ttf'),
    'BricolageGrotesque-Bold': require('../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-Bold.ttf'),
    'BricolageGrotesque-ExtraBold': require('../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-ExtraBold.ttf'),
    'BricolageGrotesque-Light': require('../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-Light.ttf'),
    'BricolageGrotesque-ExtraLight': require('../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-ExtraLight.ttf'),

    // inter
    InterThin: Inter_100Thin,
    InterExtraLight: Inter_200ExtraLight,
    InterLight: Inter_300Light,
    Inter: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
    InterExtraBold: Inter_800ExtraBold,
    InterBlack: Inter_900Black,
  });

  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <AuthProvider>
            <TripsProvider>
              <StatusBar style="auto" />
              <ToastManager
                showProgressBar={false}
                style={{ borderRadius: 20, boxShadow: 'none' }}
                theme={colorScheme === 'dark' ? 'dark' : 'light'}
              />
              <RouteGuard />
            </TripsProvider>
          </AuthProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
