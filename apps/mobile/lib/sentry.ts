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
  // Sentry's automatic URLSession swizzle (default-on in SDK v8) is
  // turned off here because it appears to interfere with the Convex
  // client's WebSocket upgrade on iOS — the symptom is `WebSocket
  // closed with code 1006: Received bad response code from server:
  // 404` despite Convex's server returning 400 for any /api/*/sync
  // path (so the 404 is being injected somewhere between iOS's
  // URLSession layer and Convex's app server). Errors, messages and
  // breadcrumbs still flow — only auto-performance HTTP transactions
  // are off. If/when the conflict is resolved upstream we can revert.
  enableAutoPerformanceTracing: false,
  tracesSampleRate: 0,
  // Keep PII off by default. Future explicit user identification (setUser)
  // can opt-in per-event.
  sendDefaultPii: false,
});

// On every cold launch surface the Updates module's view of the world.
// Helps diagnose why OTAs are or aren't landing on a build: if
// `isEmbeddedLaunch` is false on a fresh install, OTAs are applying;
// if it stays true forever, the device isn't fetching/applying. The
// channel and runtimeVersion confirm the build is on the channel and
// version we think it is.
Sentry.captureMessage('diag:boot:updates-status', {
  level: 'info',
  tags: {
    update_id: Updates.updateId ?? 'null',
    channel: Updates.channel ?? 'null',
    runtime_version: Updates.runtimeVersion ?? 'null',
    is_embedded_launch: String(Updates.isEmbeddedLaunch),
  },
});
