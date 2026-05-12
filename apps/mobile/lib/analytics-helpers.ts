import * as Crypto from "expo-crypto";

// expo-crypto only exposes digestStringAsync — callers must await before
// firing the typed track() event so the trip id never leaves this module
// unhashed.
export async function hashTripId(rawTripId: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawTripId,
  );
}

// The Convex schema's itinerary_items.type union has 7 buckets; the
// analytics contract in lib/analytics.ts has 4. Map known overlaps 1:1;
// flatten everything else into "experience" so no add silently drops out
// of the funnel. Default catches future schema additions without needing
// a compile error here.
export type AnalyticsItemBucket = "flight" | "hotel" | "event" | "experience";
export function mapItineraryItemTypeToAnalyticsBucket(
  itemType: string,
): AnalyticsItemBucket {
  switch (itemType) {
    case "flight":
      return "flight";
    case "hotel":
      return "hotel";
    case "event":
      return "event";
    case "tour":
    case "activity":
    case "restaurant":
    case "transport":
    default:
      return "experience";
  }
}

// Convex Auth raises a small known set of error class names — the same
// substrings friendlyAuthError() keys off — and the Expo Apple SDK emits
// ERR_REQUEST_CANCELED when the user dismisses the sheet. Translate both
// surfaces into stable analytics tokens so PostHog grouping is consistent
// across providers and SDKs.
export function extractAuthErrorCode(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code?: unknown }).code;
    if (code === "ERR_REQUEST_CANCELED") return "cancelled";
    if (typeof code === "string" && code) return code;
  }
  const raw =
    err instanceof Error
      ? err.message
      : err && typeof err === "object" && "message" in err
        ? String((err as { message?: unknown }).message ?? "")
        : typeof err === "string"
          ? err
          : "";
  if (/InvalidAccountId/i.test(raw)) return "InvalidAccountId";
  if (/InvalidSecret|invalid.*password/i.test(raw)) return "InvalidSecret";
  if (/AccountAlreadyExists|already.*exist/i.test(raw))
    return "AccountAlreadyExists";
  if (/TooManyRequests|rate.?limit/i.test(raw)) return "TooManyRequests";
  if (/cancel/i.test(raw)) return "cancelled";
  if (/network|fetch.failed/i.test(raw)) return "NetworkError";
  if (/timeout|timed.?out/i.test(raw)) return "Timeout";
  return "unknown";
}
