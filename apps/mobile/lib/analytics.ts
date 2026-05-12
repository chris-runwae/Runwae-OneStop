import Constants from "expo-constants";
import * as Updates from "expo-updates";
import PostHog from "posthog-react-native";

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

// Singleton — null when the key is unset (local dev without analytics, or
// kill-switched via EAS env). All exported functions become no-ops in that
// case. Same pattern as `enabled: !!dsn` in lib/sentry.ts.
const client: PostHog | null = apiKey
  ? new PostHog(apiKey, {
      host,
      // The 11-event contract in docs/phase-2.5-and-4-handover.md is the
      // ONLY thing we want to ship. Lifecycle autocapture would inject
      // Application Opened / Installed / Backgrounded events that we never
      // agreed to and that "Event names are forever" doesn't let us undo.
      captureAppLifecycleEvents: false,
      enableSessionReplay: false,
    })
  : null;

// Super-properties: attached to every event without per-call effort.
// Lets us answer "is this regression specific to one OTA bundle?" without
// re-instrumenting anything.
if (client) {
  void client.register({
    app_release: release,
    app_dist: dist,
    app_variant: variant,
  });
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
  if (!client) return;
  client.capture(event.name, event.properties);
}

// `userId` here is the Convex `users._id` value — the same identifier the
// server-side wrapper will use for `signup_completed` / `booking_completed`
// in Commit 3, so events line up on a single distinct_id.
// Hard rule: no email, name, or phone ever flows through this function.
export function identify(userId: string): void {
  if (!client) return;
  client.identify(userId);
}

export function reset(): void {
  if (!client) return;
  client.reset();
}
