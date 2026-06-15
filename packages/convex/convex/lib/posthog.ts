import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

// Server-side analytics event union. Mirrors the client union in
// apps/mobile/lib/analytics.ts for the 7 events that are owned by Convex.
// Client-side events (signin_failed, trip_viewed, itinerary_item_added,
// booking_started) live in the mobile typed wrapper, not here.
//
// "Event names are forever" — see docs/analytics-events.md.
export type ServerAnalyticsEvent =
  | {
      name: "signup_completed";
      properties: { provider: "apple" | "google" | "password" };
    }
  | {
      name: "signin_succeeded";
      properties: { provider: "apple" | "google" | "password" };
    }
  | { name: "first_trip_created"; properties: Record<string, never> }
  | { name: "first_invite_accepted"; properties: Record<string, never> }
  | {
      name: "onboarding_completed";
      properties: {
        travel_party: string[];
        travel_style: string | null;
        trip_types: string[];
        pain_point: string | null;
        planning_horizon: string | null;
        skipped: boolean;
      };
    }
  | {
      name: "booking_completed";
      properties: {
        type: "hotel" | "experience" | "flight";
        amount_gbp: number;
      };
    }
  | {
      name: "booking_failed";
      properties: {
        type: "hotel" | "experience" | "flight";
        failure_reason: string;
      };
    };

// Typed helper for callers inside mutations / actions. Schedules the
// internal `serverTrack` action to run immediately after the current
// transaction commits, so the event payload reflects committed state
// (e.g. the just-inserted users row) and a track failure can never roll
// the parent transaction back.
//
// `distinctId` MUST be the Convex `users._id` stringified — same value
// the mobile client passes to `identify()` — otherwise events won't
// join across surfaces.
export async function scheduleServerTrack<E extends ServerAnalyticsEvent>(
  ctx: {
    scheduler: {
      runAfter: (
        delayMs: number,
        fnRef: typeof internal.lib.posthog.serverTrack,
        args: { distinctId: string; name: string; properties: unknown },
      ) => Promise<unknown>;
    };
  },
  distinctId: string,
  event: E,
): Promise<void> {
  await ctx.scheduler.runAfter(0, internal.lib.posthog.serverTrack, {
    distinctId,
    name: event.name,
    properties: event.properties,
  });
}

// The fire-and-forget action that actually POSTs to PostHog. Direct fetch
// to the /capture/ endpoint — no SDK dependency, no batching, no retries.
// Volume is low (<1 event per user action on a normal day), so a missed
// event from a transient outage is acceptable; protecting the parent
// mutation from PostHog flakiness matters more.
//
// Env vars (set via `npx convex env set …`):
//   POSTHOG_API_KEY  — project API key (phc_…). Without it, this is a no-op.
//   POSTHOG_HOST     — defaults to https://eu.i.posthog.com.
export const serverTrack = internalAction({
  args: {
    distinctId: v.string(),
    name: v.string(),
    properties: v.any(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.POSTHOG_API_KEY;
    if (!apiKey) {
      // Local dev / unconfigured deployments — silently no-op. Same
      // pattern as the mobile singleton in lib/analytics.ts.
      return;
    }
    const host =
      process.env.POSTHOG_HOST ?? "https://eu.i.posthog.com";

    try {
      const response = await fetch(`${host}/capture/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          event: args.name,
          distinct_id: args.distinctId,
          properties: args.properties ?? {},
          timestamp: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error("[posthog:serverTrack] non-ok response", {
          status: response.status,
          body: body.slice(0, 200),
          event: args.name,
        });
      }
    } catch (err) {
      // Never throw — best-effort. The parent mutation already committed
      // by the time the scheduler runs us, so failing here would only
      // leave a phantom scheduled job, not roll anything back.
      console.error("[posthog:serverTrack] fetch failed", {
        event: args.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },
});

// Map the bookings schema's `type` literal to the 3-bucket analytics
// enum the mobile contract uses. tour / car_rental / event_ticket all
// flatten into "experience" — same flattening logic as the itinerary
// item-type mapper in apps/mobile/lib/analytics-helpers.ts.
export function mapBookingTypeToAnalytics(
  bookingType: string,
): "hotel" | "experience" | "flight" {
  switch (bookingType) {
    case "flight":
      return "flight";
    case "hotel":
      return "hotel";
    case "tour":
    case "car_rental":
    case "event_ticket":
    default:
      return "experience";
  }
}
