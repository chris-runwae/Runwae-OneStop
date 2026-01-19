import 'dotenv/config';
import { ExpoConfig } from 'expo/config';
import { withSentry } from '@sentry/react-native/expo';

const config: ExpoConfig = {
  name: 'Runwae',
  slug: 'mobile',
  owner: 'runwae-org',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'runwae',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'io.runwae.app',
    associatedDomains: ['applinks:runwae.io'],
  },

  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: 'io.runwae.app',
  },

  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
    bundler: 'metro',
  },

  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
    'expo-sqlite',
    'expo-secure-store',
    'expo-web-browser',
    [
      'react-native-share',
      {
        ios: ['fb', 'instagram', 'twitter', 'tiktoksharesdk'],
        android: [
          'com.facebook.katana',
          'com.instagram.android',
          'com.twitter.android',
          'com.zhiliaoapp.musically',
        ],
        enableBase64ShareAndroid: true,
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    router: {},
    eas: {
      projectId: '1b62bedf-9e41-473e-9cef-05ad0795e262',
    },
    SUPABASE_FUNCTIONS_URL: process.env.SUPABASE_FUNCTIONS_URL,
    clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },

  runtimeVersion: {
    policy: 'appVersion',
  },

  updates: {
    url: 'https://u.expo.dev/1b62bedf-9e41-473e-9cef-05ad0795e262',
  },
};

export default withSentry(config, {
  url: 'https://sentry.io/',
  // Use SENTRY_AUTH_TOKEN env to authenticate with Sentry.
  project: 'react-native',
  organization: 'runwae',
});
