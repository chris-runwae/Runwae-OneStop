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
import Constants from 'expo-constants';
import { tokenCache } from '@clerk/clerk-expo/token-cache';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import ToastManager from 'toastify-react-native';

import SplashScreen from '@/components/ui/splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import '../global.css';
import { SupabaseProvider } from '@/lib/SupabaseProvider';
import { ClerkProvider } from '@clerk/clerk-expo';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const isNavigating = useRef(false);
  const lastRoute = useRef<string | null>(null);
  const {
    user,
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

  useEffect(() => {
    if (isLoading || isNavigating.current) return;

    const AUTH_ROUTES = new Set([
      '(auth)',
      'login',
      'register',
      'forgot-password',
      'check-email',
      'reset-password',
      'onboarding',
    ]);

    const ONBOARDING_STEPS = new Set([
      'onboarding',
      'onboarding-step-1',
      'onboarding-step-2',
      'onboarding-step-3',
    ]);

    const BOARDING_STEPS = new Set([
      'boarding',
      'step-1',
      'step-2',
      'step-3',
      'step-4',
    ]);

    const [currentSegment, secondSegment] = segments;
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

    console.log('RouteGuard state:', {
      isAuthenticated,
      hasSeenOnboarding,
      hasCompletedBoarding,
      currentSegment,
      secondSegment,
      isInAuthFlow,
      isInOnboardingSteps,
      isInBoardingSteps,
      isInTabs,
      isInOnboarding,
    });

    let targetRoute: string | null = null;

    if (!isAuthenticated && hasSeenOnboarding && !isInAuthFlow) {
      targetRoute = '/(auth)/login';
    } else if (
      !isAuthenticated &&
      !hasSeenOnboarding &&
      !isInOnboarding &&
      !isInOnboardingSteps &&
      !isInAuthFlow
    ) {
      targetRoute = '/(auth)/onboarding';
    } else if (
      isAuthenticated &&
      !hasCompletedBoarding &&
      !isInTabs &&
      !isInBoardingSteps
    ) {
      // Route to appropriate boarding step
      targetRoute = `/boarding/step-${currentBoardingStep}`;
    } else if (isAuthenticated && !isInTabs && !isInBoardingSteps) {
      targetRoute = '/(tabs)/index';
    }

    if (targetRoute && targetRoute !== lastRoute.current) {
      console.log('RouteGuard: Navigating to', targetRoute);
      lastRoute.current = targetRoute;
      isNavigating.current = true;
      router.replace(targetRoute as any);
      setTimeout(() => {
        isNavigating.current = false;
      }, 200);
    }
  }, [
    isAuthenticated,
    hasSeenOnboarding,
    hasCompletedBoarding,
    isLoading,
    segments,
  ]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="boarding" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: 'modal', headerShown: true, title: 'Modal' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const publishableKey =
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    Constants.expoConfig?.extra?.clerkPublishableKey;

  const colorScheme = useColorScheme();
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
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SupabaseProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <KeyboardProvider>
            <AuthProvider>
              <StatusBar style="auto" />
              <ToastManager
                showProgressBar={false}
                style={{ borderRadius: 20, boxShadow: 'none' }}
              />
              <RouteGuard />
            </AuthProvider>
          </KeyboardProvider>
        </ThemeProvider>
      </SupabaseProvider>
    </ClerkProvider>
  );
}
