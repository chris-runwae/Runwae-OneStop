import "dotenv/config";

export default {
  expo: {
    name: "Runwae",
    slug: "mobile",
    owner: "runwae-org",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "io.runwae.app",
    },

    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "io.runwae.app",
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      bundler: "metro",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-sqlite",
      "expo-secure-store",
      [
        "sentry-expo",
        {
          organization: "runwae",
          project: "react-native",
          setCommits: false,
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
        projectId: "1b62bedf-9e41-473e-9cef-05ad0795e262",
      },
      SUPABASE_FUNCTIONS_URL: process.env.SUPABASE_FUNCTIONS_URL,
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },

    runtimeVersion: {
      policy: "appVersion",
    },

    updates: {
      url: "https://u.expo.dev/1b62bedf-9e41-473e-9cef-05ad0795e262",
    },
  },
};
