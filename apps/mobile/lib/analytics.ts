import Constants from "expo-constants";
import * as Updates from "expo-updates";
// Type-only import: keeps `PostHog` available as a TS type without pulling
// the runtime module into module-eval. The actual implementation is
// `require`d inside `getClient()` so any native-module miss is contained
// to a try/catch rather than throwing at module load and corrupting the
// JS runtime startup (see the lazy-init block below for the full story).
import type PostHog from "posthog-react-native";

// Mirror the build-tagging pattern used in lib/sentry.ts so PostHog events
// can be joined to Sentry crashes by release/dist.
const appVersion = Constants.expoConfig?.version ?? "0.0.0";
const updateId = Updates.updateId;
const release = updateId ? `${appVersion}+${updateId}` : appVersion;
const dist = updateId ?? "embedded";
const variant =
  (Constants.expoConfig?.extra as { appVariant?: string } | undefined)
    ?.appVariant ?? "development";

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

// Lazy initialization with hard fault-tolerance. The PostHog constructor
// reaches into native iOS modules (posthog-react-native + its transitive
// deps on expo-application / expo-device). May 2026 incident: a v0.8.7
// OTA shipped this file to a binary built BEFORE PostHog was added —
// the eager `new PostHog(...)` at module-eval time corrupted the JS
// runtime so badly that the downstream Convex WebSocket upgrade returned
// 404 and Apple/Google sign-in hung indefinitely with no surfaceable
// error. Lesson: anything that touches native modules at boot must be
// either (a) version-gated on a binary that has them, or (b) deferred
// until first use AND wrapped in try/catch. We do (b) here so future
// native-dep mismatches degrade analytics to no-op instead of bricking
// auth.
let client: PostHog | null = null;
let initAttempted = false;

function getClient(): PostHog | null {
  if (initAttempted) return client;
  initAttempted = true;
  if (!apiKey) return null;
  try {
    // Deferred require: only loads the native module when we actually
    // need to emit an event, by which time Convex client init has had
    // a chance to run cleanly. The cast keeps the TS type from the
    // top-of-file `import type`.
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const PostHogCtor = require("posthog-react-native").default as typeof PostHog;
    client = new PostHogCtor(apiKey, {
      host,
      // The 11-event contract in docs/phase-2.5-and-4-handover.md is the
      // ONLY thing we want to ship. Lifecycle autocapture would inject
      // Application Opened / Installed / Backgrounded events that we never
      // agreed to and that "Event names are forever" doesn't let us undo.
      captureAppLifecycleEvents: false,
      enableSessionReplay: false,
    });
    void client.register({
      app_release: release,
      app_dist: dist,
      app_variant: variant,
    });
  } catch (err) {
    // No Sentry.captureException here on purpose: analytics must not
    // create a new boot-time dependency on Sentry. A silent dev-only
    // log is enough — production analytics outages are visible from the
    // PostHog dashboard (zero events).
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn("[analytics] PostHog init failed; analytics disabled:", err);
    }
  }
  return client;
}

// Discriminated union of every event the mobile client is allowed to emit.
// Adding a new event MUST be a code change here first, then a typed
// `track()` call site — this is the compile-time wall against typos and
// drift. Server-side events (signup_completed, booking_completed, etc.)
// live in the Convex `posthog-node` wrapper instead.
export type AnalyticsEvent =
  | {
      name: "signin_failed";
      properties: {
        provider: "apple" | "google" | "password";
        error_code: string;
      };
    }
  | {
      name: "trip_viewed";
      properties: {
        // sha256 of the trip id — never the raw id, never anything joinable
        // back to a user from the PostHog UI alone.
        trip_id_hash: string;
      };
    }
  | {
      name: "itinerary_item_added";
      properties: {
        item_type: "flight" | "hotel" | "event" | "experience";
      };
    }
  | {
      name: "booking_started";
      properties: {
        type: "hotel" | "experience" | "flight";
        amount_gbp: number;
      };
    };

export function track<E extends AnalyticsEvent>(event: E): void {
  const c = getClient();
  if (!c) return;
  c.capture(event.name, event.properties);
}

// `userId` here is the Convex `users._id` value — the same identifier the
// server-side wrapper will use for `signup_completed` / `booking_completed`
// in Commit 3, so events line up on a single distinct_id.
// Hard rule: no email, name, or phone ever flows through this function.
export function identify(userId: string): void {
  const c = getClient();
  if (!c) return;
  c.identify(userId);
}

export function reset(): void {
  const c = getClient();
  if (!c) return;
  c.reset();
}
