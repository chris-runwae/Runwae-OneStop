import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { DiscoveryDetail, DiscoveryItem } from "./types";

// Yelp Fusion — restaurant listings (no native commission).
// Pair with an OpenTable affiliate URL for commissionable booking, when
// the restaurant has a known reservations partner.

const BASE = "https://api.yelp.com/v3";

function affiliateUrl(name: string, locationName?: string): string {
  const ref = process.env.OPENTABLE_AFFILIATE_REF;
  const q = encodeURIComponent(`${name} ${locationName ?? ""}`.trim());
  if (ref) return `https://www.opentable.com/s?term=${q}&ref=${ref}`;
  return `https://www.opentable.com/s?term=${q}`;
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
    { term, lat, lng, limit },
  ): Promise<DiscoveryItem[]> => {
    const apiKey = process.env.YELP_KEY;
    if (!apiKey) return [];
    try {
      const url = new URL(`${BASE}/businesses/search`);
      url.searchParams.set("categories", "restaurants,food");
      if (lat !== undefined && lng !== undefined) {
        url.searchParams.set("latitude", String(lat));
        url.searchParams.set("longitude", String(lng));
      } else if (term) {
        url.searchParams.set("location", term);
      } else {
        return [];
      }
      url.searchParams.set("limit", String(Math.min(limit, 20)));
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      });
      if (!res.ok) return [];
      const json = (await res.json()) as { businesses?: any[] };
      const list = json.businesses ?? [];
      return list.slice(0, limit).map((b: any) => ({
        provider: "yelp" as const,
        apiRef: String(b.id ?? ""),
        category: "eat" as const,
        title: b.name,
        description: b.categories?.map((c: any) => c.title).join(" · "),
        imageUrl: b.image_url,
        price: undefined, // Yelp uses $ tier, not numeric
        currency: undefined,
        externalUrl: affiliateUrl(b.name, b.location?.city),
        locationName: b.location?.city,
        coords: b.coordinates ? { lat: b.coordinates.latitude, lng: b.coordinates.longitude } : undefined,
        rating: b.rating,
      }));
    } catch (err) {
      console.error("[yelp] fetch failed", err);
      return [];
    }
  },
});

export const getDetail = internalAction({
  args: { apiRef: v.string() },
  handler: async (_ctx, { apiRef }): Promise<DiscoveryDetail | null> => {
    const apiKey = process.env.YELP_KEY;
    if (!apiKey) return null;
    try {
      const res = await fetch(`${BASE}/businesses/${encodeURIComponent(apiRef)}`, {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      });
      if (!res.ok) return null;
      const b = await res.json() as any;
      return {
        provider: "yelp",
        apiRef: String(b.id ?? apiRef),
        category: "eat",
        title: b.name,
        description: b.categories?.map((c: any) => c.title).join(" · "),
        imageUrl: b.image_url ?? b.photos?.[0],
        price: undefined,
        currency: undefined,
        externalUrl: affiliateUrl(b.name, b.location?.city),
        locationName: b.location?.city,
        address: b.location?.display_address?.join(", "),
        coords: b.coordinates ? { lat: b.coordinates.latitude, lng: b.coordinates.longitude } : undefined,
        rating: b.rating,
        reviewCount: b.review_count,
        gallery: Array.isArray(b.photos) ? b.photos : undefined,
        highlights: b.transactions,
      };
    } catch (err) {
      console.error("[yelp] getDetail failed", err);
      return null;
    }
  },
});
