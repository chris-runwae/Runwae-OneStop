import '@/lib/sentry';
import * as Sentry from '@sentry/react-native';
import * as analytics from '@/lib/analytics';
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
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
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
  const { colorScheme } = useColorScheme();
  const {
    user,
    isLoading,
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

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: screenBackgroundColor },
      }}>
      <Stack.Protected guard={!isAuthenticated || !user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
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
