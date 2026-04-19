import type { ConfigContext, ExpoConfig } from 'expo/config';
import pjson from './package.json';

type AppVariant = 'development' | 'preview' | 'production';

/** Set by EAS per profile (eas.json). For local builds, use APP_VARIANT or EXPO_PUBLIC_APP_VARIANT. */
function resolveAppVariant(): AppVariant {
  const raw =
    process.env.APP_VARIANT ??
    process.env.EXPO_PUBLIC_APP_VARIANT ??
    process.env.EAS_BUILD_PROFILE;

  if (raw === 'development' || raw === 'preview' || raw === 'production') {
    return raw;
  }
  // Default: development for local `expo run:*` so the dev app can install alongside prod.
  return 'development';
}

const VARIANT_CONFIG: Record<
  AppVariant,
  {
    name: string;
    iosBundleIdentifier: string;
    androidPackage: string;
    scheme: string;
    stripeMerchantIdentifier: string;
  }
> = {
  development: {
    name: 'Runwae (Dev)',
    iosBundleIdentifier: 'io.runwae.app.dev',
    androidPackage: 'io.runwae.app.dev',
    scheme: 'runwae-dev',
    stripeMerchantIdentifier: 'merchant.io.runwae.app.dev',
  },
  preview: {
    name: 'Runwae (Preview)',
    iosBundleIdentifier: 'io.runwae.app.preview',
    androidPackage: 'io.runwae.app.preview',
    scheme: 'runwae-preview',
    stripeMerchantIdentifier: 'merchant.io.runwae.app.preview',
  },
  production: {
    name: 'Runwae',
    iosBundleIdentifier: 'io.runwae.app',
    androidPackage: 'io.runwae.app',
    scheme: 'runwae',
    stripeMerchantIdentifier: 'merchant.io.runwae.app',
  },
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = resolveAppVariant();
  const v = VARIANT_CONFIG[variant];

  return {
    ...config,
    name: v.name,
    slug: 'runwae-rn',
    version: pjson.version,
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: v.scheme,
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: v.iosBundleIdentifier,
      associatedDomains: ['applinks:app.runwae.io'],
      runtimeVersion: {
        policy: 'appVersion',
      },
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
    package: v.androidPackage,
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'app.runwae.io',
            pathPrefix: '/trip',
          },
          {
            scheme: 'https',
            host: 'app.runwae.io',
            pathPrefix: '/hotel',
          },
          {
            scheme: 'https',
            host: 'app.runwae.io',
            pathPrefix: '/destination',
          },
          {
            scheme: 'https',
            host: 'app.runwae.io',
            pathPrefix: '/invite',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    permissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
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
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        project: 'react-native',
        organization: 'splash-za',
      },
    ],
    'expo-font',
    '@react-native-community/datetimepicker',
    [
      'expo-maps',
      {
        requestLocationPermission: true,
        locationPermission: 'Allow Runwae to use your location',
      },
    ],
    [
      '@stripe/stripe-react-native',
      {
        merchantIdentifier: v.stripeMerchantIdentifier,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  // @ts-expect-error - fonts is not a valid property in the ExpoConfig type
  fonts: [
    {
      src: './assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-Regular.ttf',
      family: 'BricolageGrotesque',
      weight: '400',
    },
    {
      src: './assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-Medium.ttf',
      family: 'BricolageGrotesque',
      weight: '500',
    },
    {
      src: './assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-SemiBold.ttf',
      family: 'BricolageGrotesque',
      weight: '600',
    },
    {
      src: './assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-Bold.ttf',
      family: 'BricolageGrotesque',
      weight: '700',
    },
    {
      src: './assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-ExtraBold.ttf',
      family: 'BricolageGrotesque',
      weight: '800',
    },
    {
      src: './assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-Light.ttf',
      family: 'BricolageGrotesque',
      weight: '300',
    },
    {
      src: './assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-ExtraLight.ttf',
      family: 'BricolageGrotesque',
      weight: '200',
    },
  ],
  extra: {
    appVariant: variant,
    stripeMerchantIdentifier: v.stripeMerchantIdentifier,
    router: {},
    eas: {
      projectId: '06ce5302-3e4b-43dd-bcdc-7ea53aa4e45d',
    },
  },
  updates: {
    url: 'https://u.expo.dev/06ce5302-3e4b-43dd-bcdc-7ea53aa4e45d',
    enabled: true,
    fallbackToCacheTimeout: 0,
    checkAutomatically: 'ON_LOAD',
  },
};
};
