import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { DiscoveryDetail, DiscoveryItem } from "./types";

// Ticketmaster Discovery API — free, instant key from
// https://developer.ticketmaster.com. 5k req/day default quota.
const TM_BASE = "https://app.ticketmaster.com/discovery/v2";

function pickImage(images?: { url?: string; ratio?: string; width?: number }[]):
  | string
  | undefined {
  if (!images || images.length === 0) return undefined;
  // Prefer 16x9 then widest available.
  const sixteen = images.find((i) => i.ratio === "16_9" && i.url);
  if (sixteen) return sixteen.url;
  const sorted = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return sorted[0]?.url;
}

export const search = internalAction({
  args: {
    category: v.string(),
    term: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    limit: v.number(),
  },
  handler: async (
    _ctx,
    { category, term, lat, lng, limit }
  ): Promise<DiscoveryItem[]> => {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) {
      console.warn("[ticketmaster] TICKETMASTER_API_KEY not set");
      return [];
    }

    const url = new URL(`${TM_BASE}/events.json`);
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("size", String(Math.min(limit, 20)));
    url.searchParams.set("sort", "date,asc");
    if (term.trim()) url.searchParams.set("city", term.trim());
    if (lat !== undefined && lng !== undefined) {
      url.searchParams.set("latlong", `${lat},${lng}`);
      url.searchParams.set("radius", "50");
      url.searchParams.set("unit", "km");
    }

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        console.warn("[ticketmaster] events.json not ok", res.status);
        return [];
      }
      const json = (await res.json()) as {
        _embedded?: {
          events?: Array<{
            id: string;
            name: string;
            url?: string;
            info?: string;
            images?: { url?: string; ratio?: string; width?: number }[];
            dates?: { start?: { localDate?: string; localTime?: string } };
            _embedded?: {
              venues?: Array<{
                name?: string;
                city?: { name?: string };
                location?: { latitude?: string; longitude?: string };
              }>;
            };
            priceRanges?: Array<{ min?: number; currency?: string }>;
          }>;
        };
      };
      const events = json._embedded?.events ?? [];
      return events.slice(0, limit).map((e): DiscoveryItem => {
        const venue = e._embedded?.venues?.[0];
        const venueLat = venue?.location?.latitude
          ? parseFloat(venue.location.latitude)
          : undefined;
        const venueLng = venue?.location?.longitude
          ? parseFloat(venue.location.longitude)
          : undefined;
        return {
          provider: "ticketmaster",
          apiRef: e.id,
          category: category as DiscoveryItem["category"],
          title: e.name,
          description:
            e.info ??
            [e.dates?.start?.localDate, venue?.name].filter(Boolean).join(" · "),
          imageUrl: pickImage(e.images),
          price: e.priceRanges?.[0]?.min,
          currency: e.priceRanges?.[0]?.currency,
          externalUrl: e.url,
          locationName: venue?.city?.name ?? venue?.name,
          coords:
            venueLat !== undefined && venueLng !== undefined
              ? { lat: venueLat, lng: venueLng }
              : undefined,
        };
      });
    } catch (err) {
      console.error("[ticketmaster] fetch failed", err);
      return [];
    }
  },
});

export const getDetail = internalAction({
  args: { apiRef: v.string() },
  handler: async (_ctx, { apiRef }): Promise<DiscoveryDetail | null> => {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) return null;
    try {
      const res = await fetch(
        `${TM_BASE}/events/${encodeURIComponent(apiRef)}.json?apikey=${apiKey}`
      );
      if (!res.ok) return null;
      const e = (await res.json()) as any;
      const venue = e._embedded?.venues?.[0];
      return {
        provider: "ticketmaster",
        apiRef: e.id,
        category: "event",
        title: e.name,
        description: e.info ?? e.pleaseNote ?? e.description,
        imageUrl: pickImage(e.images),
        price: e.priceRanges?.[0]?.min,
        currency: e.priceRanges?.[0]?.currency,
        externalUrl: e.url,
        locationName: venue?.city?.name ?? venue?.name,
        gallery: e.images?.map((i: any) => i.url).filter(Boolean).slice(0, 8),
        address:
          venue?.address?.line1 && venue?.city?.name
            ? `${venue.address.line1}, ${venue.city.name}`
            : venue?.name,
      };
    } catch (err) {
      console.error("[ticketmaster] getDetail failed", err);
      return null;
    }
  },
});
