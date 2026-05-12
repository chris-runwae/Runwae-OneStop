import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import * as Updates from "expo-updates";

// Release identifies the native binary version a crash belongs to.
// Dist further pins to the specific JS bundle that was running — embedded
// at build time, or the OTA update ID if a newer JS bundle was downloaded.
// Together they let Sentry attribute every event to a unique
// "native build + JS bundle" pair, which is exactly what you need when
// triaging whether a crash spans builds or only hit one OTA rollout.
const appVersion = Constants.expoConfig?.version ?? "0.0.0";
const updateId = Updates.updateId;
const release = updateId ? `${appVersion}+${updateId}` : appVersion;
const dist = updateId ?? "embedded";

const variant =
  (Constants.expoConfig?.extra as { appVariant?: string } | undefined)
    ?.appVariant ?? "development";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  release,
  dist,
  environment: variant,
  // DIAGNOSTIC (v0.8.10): the previous build with
  // enableAutoPerformanceTracing:false did NOT fix the Convex WebSocket
  // 404 — the JS flag turns off Sentry's auto-instrumentation tracing
  // but the native iOS SDK installs its URLSession swizzle at native
  // init regardless. enableNative:false is the only way to keep the
  // native SDK from loading at all, which prevents the swizzle from
  // ever touching URLSession. If WS connects with this off, the swizzle
  // was the cause; if WS still 404s, Sentry is innocent.
  enableNative: false,
  autoInitializeNativeSdk: false,
  enableAutoPerformanceTracing: false,
  tracesSampleRate: 0,
  // Keep PII off by default. Future explicit user identification (setUser)
  // can opt-in per-event.
  sendDefaultPii: false,
});
