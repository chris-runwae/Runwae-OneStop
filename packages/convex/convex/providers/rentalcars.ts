import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { DiscoveryDetail, DiscoveryItem } from "./types";

// CarTrawler / Rentalcars Connect — affiliate car-rental search.
// Endpoint shape varies by partner (CarTrawler XML, Rentalcars Connect JSON).
// We use the public CarTrawler JSON endpoint when CARTRAWLER_KEY + CARTRAWLER_CLIENT_ID are set.
const BASE = "https://otatest.cartrawler.com/ctabe";

export const search = internalAction({
  args: {
    category: v.string(),
    term: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    limit: v.number(),
    checkin: v.optional(v.string()),
    checkout: v.optional(v.string()),
  },
  handler: async (
    _ctx,
    { term, lat, lng, limit, checkin, checkout },
  ): Promise<DiscoveryItem[]> => {
    const apiKey = process.env.CARTRAWLER_KEY;
    const clientId = process.env.CARTRAWLER_CLIENT_ID;
    if (!apiKey || !clientId) return [];
    if (!checkin || !checkout) return [];
    const pickup = lat !== undefined && lng !== undefined
      ? { latitude: lat, longitude: lng }
      : { name: term };
    try {
      const res = await fetch(`${BASE}/json/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Api-Key": apiKey,
          "X-Client-Id": clientId,
        },
        body: JSON.stringify({
          pickUpLocation: pickup,
          dropOffLocation: pickup,
          pickUpDateTime: `${checkin}T10:00:00`,
          dropOffDateTime: `${checkout}T10:00:00`,
          driverAge: 30,
          currency: "GBP",
        }),
      });
      if (!res.ok) {
        console.warn("[rentalcars] response not ok", res.status);
        return [];
      }
      const json = (await res.json()) as { vehicles?: any[] };
      const vehicles = json.vehicles ?? [];
      return vehicles.slice(0, limit).map((v2: any) => ({
        provider: "rentalcars" as const,
        apiRef: String(v2.referenceId ?? v2.id ?? ""),
        category: "ride" as const,
        title: `${v2.make ?? ""} ${v2.model ?? "Car"}`.trim(),
        description: `${v2.transmission ?? ""} · ${v2.passengerCount ?? "?"} seats`,
        imageUrl: v2.images?.[0]?.url ?? v2.imageUrl,
        price: v2.totalPrice,
        currency: v2.currencyCode ?? "GBP",
        externalUrl: v2.bookingUrl,
        rating: v2.rating,
      }));
    } catch (err) {
      console.error("[rentalcars] fetch failed", err);
      return [];
    }
  },
});

export const getDetail = internalAction({
  args: { apiRef: v.string() },
  handler: async (_ctx, { apiRef }): Promise<DiscoveryDetail | null> => {
    // CarTrawler vehicle availability is a single-shot search — there's no
    // long-lived detail endpoint. The detail page reuses cached data from
    // the search result; this stub returns null so callers fall back to cache.
    void apiRef;
    return null;
  },
});
