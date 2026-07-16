import '@/lib/sentry';
import * as Sentry from '@sentry/react-native';
import * as analytics from '@/lib/analytics';
// Side-effect import: i18next is initialised at module load with the
// device locale as default. LocaleSync (below) re-syncs from
// `users.locale` once the viewer is authenticated.
import '@/lib/i18n';
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
} from 'expo-router/react-navigation';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useFonts } from 'expo-font';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import ToastManager from 'toastify-react-native';

import SplashScreen from '@/components/ui/splash-screen';
import LocaleSync from '@/components/i18n/LocaleSync';
import {
  STRIPE_MERCHANT_IDENTIFIER,
  StripeProviderSafe,
} from '@/utils/stripe-safe';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useAppleCredentialsRevoke } from '@/hooks/useAppleCredentialsRevoke';
import { TripsProvider } from '@/context/TripsContext';
import { convex } from '@/lib/convex';
import {
  configurePushHandler,
  registerPushNotifications,
} from '@/lib/pushNotifications';
import { secureStorage } from '@/lib/secureStorage';
import { getThemePreference } from '@/utils/storage';
import { cssInterop, useColorScheme } from 'nativewind';
import { Image as ExpoImageComponent } from 'expo-image';
import '../global.css';

export { ErrorBoundary } from '@/components/ui/RouteErrorBoundary';

cssInterop(ExpoImageComponent, { className: 'style' });

configurePushHandler();

const stripeMerchantIdentifier = STRIPE_MERCHANT_IDENTIFIER;

function RouteGuard() {
  const segments = useSegments();
  const { colorScheme } = useColorScheme();
  const {
    user,
    isLoading,
    hasCompletedBoarding,
    currentBoardingStep,
    isAuthenticated,
    initialize,
  } = useAuth();

  const screenBackgroundColor = colorScheme === 'dark' ? '#000000' : '#FFFFFF';

  // Sign the user out if they revoke Apple credentials in iOS Settings.
  useAppleCredentialsRevoke();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void registerPushNotifications(convex);
  }, [isAuthenticated]);

  useEffect(() => {
    if (user?.id) {
      analytics.identify(user.id);
    } else {
      analytics.reset();
    }
  }, [user?.id]);

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
    'verification-sent',
    'reset-success',
    'email-confirmation',
    'onboarding',
    'onboarding-steps',
  ]);

  const BOARDING_STEPS = new Set([
    'boarding',
    'step-1',
    'step-2',
    'step-3',
    'step-4',
    'step-5',
  ]);

  const [currentSegment, secondSegment] = segments as string[];
  const isInAuthFlow =
    AUTH_ROUTES.has(currentSegment) ||
    (currentSegment === '(auth)' &&
      secondSegment &&
      AUTH_ROUTES.has(secondSegment));
  const isInBoardingSteps =
    currentSegment === 'boarding' &&
    secondSegment &&
    BOARDING_STEPS.has(secondSegment);
  const isInAuthorizedRoot = [
    undefined,
    '(tabs)',
    'notifications',
    'modal',
    'itinerary',
    'experience',
    'viator',
    'destination',
    'create-trip',
    'create-trip-options',
    'create-trip-ai',
    'create-trip-from-link',
    'events',
    'search',
    'flights',
    'hotel',
    'hotels',
    'hotels-search',
    'experiences-search',
    'invite',
    'trip',
    'feed',
  ].includes(currentSegment as any);

  // Redirection Logic
  if (!isAuthenticated && !isInAuthFlow) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  // Email-verification gate is intentionally disabled until the Convex auth
  // setup adds a verifier (Resend integration). Password sign-ups land
  // straight in the boarding flow.

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
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: screenBackgroundColor },
      }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="boarding" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="create-trip/index" options={{ headerShown: false }} />
      <Stack.Screen name="itinerary" options={{ headerShown: false }} />
      <Stack.Screen name="experience" options={{ headerShown: false }} />
      <Stack.Screen name="viator" options={{ headerShown: false }} />
      <Stack.Screen name="destination" options={{ headerShown: false }} />
      <Stack.Screen name="events" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen
        name="flights"
        options={{ presentation: 'modal', headerShown: false }}
      />
      <Stack.Screen
        name="hotels-search"
        options={{ presentation: 'modal', headerShown: false }}
      />
      <Stack.Screen
        name="experiences-search"
        options={{ presentation: 'modal', headerShown: false }}
      />
      <Stack.Screen name="hotel" options={{ headerShown: false }} />
      <Stack.Screen name="hotels" options={{ headerShown: false }} />
      <Stack.Screen name="invite" options={{ headerShown: false }} />
      <Stack.Screen name="trip" options={{ headerShown: false }} />
      <Stack.Screen name="itinerary/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="experience/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="feed" options={{ headerShown: false }} />
      <Stack.Screen
        name="create-trip-options"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: [0.85, 1],
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
        }}
      />
      <Stack.Screen
        name="create-trip-ai"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: [0.85, 1],
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
        }}
      />
      <Stack.Screen
        name="create-trip-from-link"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: [0.85, 1],
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
        }}
      />
      <Stack.Screen
        name="modal"
        options={{ presentation: 'modal', headerShown: true, title: 'Modal' }}
      />
    </Stack>
  );
}

function RootLayout() {
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
    <ConvexAuthProvider client={convex} storage={secureStorage}>
      <StripeProviderSafe
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''}
        merchantIdentifier={stripeMerchantIdentifier}>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
                  <LocaleSync />
                  <RouteGuard />
                </TripsProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
      </StripeProviderSafe>
    </ConvexAuthProvider>
  );
}

export default Sentry.wrap(RootLayout);
