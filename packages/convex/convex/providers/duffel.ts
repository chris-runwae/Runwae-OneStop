import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { DiscoveryDetail, DiscoveryItem } from "./types";

// Duffel — flights API. Commission via Duffel partner programme.
// Flight discovery is offer-based: we issue an offer_request, then read offers.
// We surface the cheapest one-way "explore" offer per destination as a card.
const BASE = "https://api.duffel.com";
const VERSION = "v2";

function originFor(_term: string): string | null {
  // Without explicit user origin we can't issue a real Duffel offer_request.
  // Caller passes origin via term ("LON"|"LHR"|...) once we wire it from trip context.
  // Duffel needs IATA codes, so for the MVP we treat term as IATA when it's a 3-char upper string.
  return null;
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
    const origin = originIata ?? originFor(term);
    const dest = destinationIata ?? (term && term.length === 3 ? term.toUpperCase() : null);
    if (!origin || !dest || !checkin) {
      // Without an origin/destination IATA + departure date, Duffel can't price.
      return [];
    }
    try {
      const body = {
        data: {
          slices: [
            { origin, destination: dest, departure_date: checkin },
            ...(checkout ? [{ origin: dest, destination: origin, departure_date: checkout }] : []),
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
        console.warn("[duffel] offer_request not ok", res.status);
        return [];
      }
      const json = (await res.json()) as { data?: any };
      const offers: any[] = json.data?.offers ?? [];
      const sorted = offers.sort((a, b) => Number(a.total_amount) - Number(b.total_amount));
      return sorted.slice(0, limit).map((o: any) => ({
        provider: "duffel" as const,
        apiRef: String(o.id ?? ""),
        category: "fly" as const,
        title: `${o.owner?.name ?? "Flight"} ${origin} → ${dest}`,
        description: `Total ${o.slices?.length ?? 1} segment(s). Departs ${checkin}.`,
        imageUrl: o.owner?.logo_symbol_url,
        price: Number(o.total_amount),
        currency: o.total_currency,
        rating: undefined,
      }));
    } catch (err) {
      console.error("[duffel] fetch failed", err);
      return [];
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
