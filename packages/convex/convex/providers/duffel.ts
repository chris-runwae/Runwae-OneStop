import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { DiscoveryDetail, DiscoveryItem } from "./types";

// Duffel — flights API. Commission via Duffel partner programme.
// Flight discovery is offer-based: we issue an offer_request, then read offers.
//
// Two modes:
//   1. Single-route (trip detail): caller passes destinationIata. We return up
//      to `limit` offers for that one origin→destination route, cheapest first.
//   2. Exploration (home Discover): caller passes only originIata. We fan out
//      to a curated set of popular destinations and return the cheapest offer
//      per destination so the user sees varied route ideas, not 6 prices for
//      the same flight.
const BASE = "https://api.duffel.com";
const VERSION = "v2";

// Curated mix of close European, transatlantic, Middle East and African
// destinations so the home Fly chip surfaces a varied set of route ideas.
// Order is preserved when filtering — earlier entries appear first if `limit`
// clips the list.
const POPULAR_DESTINATIONS: ReadonlyArray<{ iata: string; city: string }> = [
  { iata: "LIS", city: "Lisbon" },
  { iata: "BCN", city: "Barcelona" },
  { iata: "AMS", city: "Amsterdam" },
  { iata: "CDG", city: "Paris" },
  { iata: "JFK", city: "New York" },
  { iata: "DXB", city: "Dubai" },
  { iata: "LOS", city: "Lagos" },
  { iata: "LAX", city: "Los Angeles" },
];

async function fetchOffersForRoute(
  apiKey: string,
  origin: string,
  destination: string,
  checkin: string,
  checkout?: string,
): Promise<any[]> {
  const body = {
    data: {
      slices: [
        { origin, destination, departure_date: checkin },
        ...(checkout
          ? [{ origin: destination, destination: origin, departure_date: checkout }]
          : []),
      ],
      passengers: [{ type: "adult" }],
      cabin_class: "economy",
    },
  };
  const res = await fetch(`${BASE}/air/offer_requests?return_offers=true`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Duffel-Version": VERSION,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.warn("[duffel] offer_request not ok", {
      status: res.status, origin, destination,
    });
    return [];
  }
  const json = (await res.json()) as { data?: any };
  const offers: any[] = json.data?.offers ?? [];
  return offers.sort((a, b) => Number(a.total_amount) - Number(b.total_amount));
}

function offerToItem(
  offer: any,
  origin: string,
  destination: string,
  destinationCity: string | undefined,
  checkin: string,
): DiscoveryItem {
  const cityLabel = destinationCity ?? destination;
  return {
    provider: "duffel" as const,
    apiRef: String(offer.id ?? ""),
    category: "fly" as const,
    title: `${cityLabel} (${destination})`,
    description: `${origin} → ${destination} · ${offer.owner?.name ?? "Flight"} · departs ${checkin}.`,
    imageUrl: offer.owner?.logo_symbol_url,
    price: Number(offer.total_amount),
    currency: offer.total_currency,
    locationName: cityLabel,
    rating: undefined,
  };
}

export const search = internalAction({
  args: {
    category: v.string(),
    term: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    limit: v.number(),
    checkin: v.optional(v.string()),
    checkout: v.optional(v.string()),
    originIata: v.optional(v.string()),
    destinationIata: v.optional(v.string()),
  },
  handler: async (
    _ctx,
    { term, limit, checkin, checkout, originIata, destinationIata },
  ): Promise<DiscoveryItem[]> => {
    const apiKey = process.env.DUFFEL_KEY;
    if (!apiKey) return [];
    const origin = originIata?.toUpperCase() ?? null;
    const explicitDest =
      destinationIata?.toUpperCase() ??
      (term && term.length === 3 ? term.toUpperCase() : null);
    if (!origin || !checkin) {
      // Need at least the user's origin airport + a departure date to price.
      return [];
    }

    try {
      // Mode 1 — Single-route. Caller knows the destination (trip-detail
      // Discover tab). Return up to `limit` cheapest offers for that route.
      if (explicitDest) {
        const offers = await fetchOffersForRoute(
          apiKey, origin, explicitDest, checkin, checkout,
        );
        return offers
          .slice(0, limit)
          .map((o) => offerToItem(o, origin, explicitDest, undefined, checkin));
      }

      // Mode 2 — Exploration. No destination supplied (home Discover). Fan
      // out to popular destinations from the user's origin and surface the
      // cheapest offer per destination.
      const targets = POPULAR_DESTINATIONS
        .filter((d) => d.iata !== origin)
        .slice(0, limit);
      const settled = await Promise.allSettled(
        targets.map((d) =>
          fetchOffersForRoute(apiKey, origin, d.iata, checkin, checkout),
        ),
      );
      const items: DiscoveryItem[] = [];
      for (let i = 0; i < settled.length; i += 1) {
        const r = settled[i];
        const target = targets[i];
        if (r.status !== "fulfilled") {
          console.warn("[duffel] fan-out leg rejected", {
            origin, destination: target.iata, reason: String(r.reason),
          });
          continue;
        }
        const cheapest = r.value[0];
        if (!cheapest) continue;
        items.push(
          offerToItem(cheapest, origin, target.iata, target.city, checkin),
        );
      }
      return items.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } catch (err) {
      console.error("[duffel] fetch failed", err);
      return [];
    }
  },
});

export type DuffelOfferDetail = {
  apiRef: string;
  carrier: string;
  carrierLogo?: string;
  totalAmount: number;
  currency: string;
  segments: Array<{
    origin: string;
    destination: string;
    depart: string;
    arrive: string;
    carrier: string;
    flightNumber: string;
    duration?: string;
  }>;
  passengers: Array<{ id: string; type: string }>;
};

export const getOfferDetail = internalAction({
  args: { apiRef: v.string() },
  handler: async (_ctx, { apiRef }): Promise<DuffelOfferDetail | null> => {
    const apiKey = process.env.DUFFEL_KEY;
    if (!apiKey) return null;
    try {
      const res = await fetch(`${BASE}/air/offers/${encodeURIComponent(apiRef)}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "Duffel-Version": VERSION,
        },
      });
      if (!res.ok) return null;
      const { data: o } = (await res.json()) as { data?: any };
      if (!o) return null;
      const segs: DuffelOfferDetail["segments"] = [];
      for (const slice of o.slices ?? []) {
        for (const seg of slice.segments ?? []) {
          segs.push({
            origin: seg.origin?.iata_code ?? "",
            destination: seg.destination?.iata_code ?? "",
            depart: seg.departing_at ?? "",
            arrive: seg.arriving_at ?? "",
            carrier: seg.marketing_carrier?.name ?? "",
            flightNumber: `${seg.marketing_carrier?.iata_code ?? ""}${seg.marketing_carrier_flight_number ?? ""}`,
            duration: seg.duration,
          });
        }
      }
      return {
        apiRef: String(o.id ?? apiRef),
        carrier: o.owner?.name ?? "Flight",
        carrierLogo: o.owner?.logo_symbol_url,
        totalAmount: Number(o.total_amount),
        currency: o.total_currency,
        segments: segs,
        passengers: (o.passengers ?? []).map((p: any) => ({
          id: String(p.id),
          type: String(p.type ?? "adult"),
        })),
      };
    } catch (err) {
      console.error("[duffel] getOfferDetail failed", err);
      return null;
    }
  },
});

export const createOrder = internalAction({
  args: {
    offerId: v.string(),
    passengers: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        gender: v.string(),
        bornOn: v.string(),
        email: v.string(),
        phoneE164: v.string(),
      })
    ),
    paymentAmount: v.number(),
    paymentCurrency: v.string(),
  },
  handler: async (
    _ctx,
    args,
  ): Promise<{ orderId: string; bookingReference?: string } | null> => {
    const apiKey = process.env.DUFFEL_KEY;
    if (!apiKey) return null;
    try {
      const res = await fetch(`${BASE}/air/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Duffel-Version": VERSION,
        },
        body: JSON.stringify({
          data: {
            type: "instant",
            selected_offers: [args.offerId],
            passengers: args.passengers.map((p) => ({
              id: p.id,
              title: p.title,
              given_name: p.firstName,
              family_name: p.lastName,
              gender: p.gender,
              born_on: p.bornOn,
              email: p.email,
              phone_number: p.phoneE164,
            })),
            payments: [
              {
                type: "balance",
                amount: args.paymentAmount.toFixed(2),
                currency: args.paymentCurrency,
              },
            ],
          },
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error("[duffel] createOrder failed", res.status, txt.slice(0, 300));
        return null;
      }
      const { data } = (await res.json()) as { data?: any };
      if (!data) return null;
      return {
        orderId: String(data.id),
        bookingReference: data.booking_reference ? String(data.booking_reference) : undefined,
      };
    } catch (err) {
      console.error("[duffel] createOrder error", err);
      return null;
    }
  },
});

export const getDetail = internalAction({
  args: { apiRef: v.string() },
  handler: async (_ctx, { apiRef }): Promise<DiscoveryDetail | null> => {
    const apiKey = process.env.DUFFEL_KEY;
    if (!apiKey) return null;
    try {
      const res = await fetch(`${BASE}/air/offers/${encodeURIComponent(apiRef)}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "Duffel-Version": VERSION,
        },
      });
      if (!res.ok) return null;
      const { data: o } = (await res.json()) as { data?: any };
      if (!o) return null;
      const segments: string[] = [];
      for (const slice of o.slices ?? []) {
        for (const seg of slice.segments ?? []) {
          segments.push(
            `${seg.origin?.iata_code} → ${seg.destination?.iata_code} · ${seg.marketing_carrier?.name ?? ""} ${seg.marketing_carrier_flight_number ?? ""}`.trim(),
          );
        }
      }
      const firstSlice = o.slices?.[0];
      return {
        provider: "duffel",
        apiRef: String(o.id ?? apiRef),
        category: "fly",
        title: `${o.owner?.name ?? "Flight"} ${firstSlice?.origin?.iata_code ?? ""} → ${firstSlice?.destination?.iata_code ?? ""}`,
        description: segments.join(" · "),
        imageUrl: o.owner?.logo_symbol_url,
        price: Number(o.total_amount),
        currency: o.total_currency,
        highlights: segments,
      };
    } catch (err) {
      console.error("[duffel] getDetail failed", err);
      return null;
    }
  },
});
