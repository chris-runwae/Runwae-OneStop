import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { DiscoveryDetail, DiscoveryItem } from "./types";

// Tiqets Affiliate API — tickets/attractions, commission via referral.
// https://tiqets-affiliates.com/affiliate-api/

const BASE = "https://api.tiqets.com/v2/affiliates";

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
    const apiKey = process.env.TIQETS_KEY;
    if (!apiKey) return [];
    try {
      const url = new URL(`${BASE}/products`);
      if (lat !== undefined && lng !== undefined) {
        url.searchParams.set("latitude", String(lat));
        url.searchParams.set("longitude", String(lng));
        url.searchParams.set("radius", "20");
      } else if (term) {
        url.searchParams.set("query", term);
      } else {
        return [];
      }
      url.searchParams.set("page_size", String(Math.min(limit, 12)));
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Token ${apiKey}`, Accept: "application/json" },
      });
      if (!res.ok) return [];
      const json = (await res.json()) as { products?: any[] };
      const products = json.products ?? [];
      return products.slice(0, limit).map((p: any) => ({
        provider: "tiqets" as const,
        apiRef: String(p.id ?? ""),
        category: "event" as const,
        title: p.title ?? "Event",
        description: p.tagline ?? p.summary?.slice(0, 200),
        imageUrl: p.image_url ?? p.cover_image,
        price: p.price?.from,
        currency: p.price?.currency ?? "GBP",
        externalUrl: p.url,
        locationName: p.city,
        rating: p.rating?.score,
      }));
    } catch (err) {
      console.error("[tiqets] fetch failed", err);
      return [];
    }
  },
});

export const getDetail = internalAction({
  args: { apiRef: v.string() },
  handler: async (_ctx, { apiRef }): Promise<DiscoveryDetail | null> => {
    const apiKey = process.env.TIQETS_KEY;
    if (!apiKey) return null;
    try {
      const res = await fetch(`${BASE}/products/${encodeURIComponent(apiRef)}`, {
        headers: { Authorization: `Token ${apiKey}`, Accept: "application/json" },
      });
      if (!res.ok) return null;
      const p = await res.json() as any;
      const gallery = Array.isArray(p.images) ? p.images.map((i: any) => i.url ?? i).filter(Boolean) : undefined;
      return {
        provider: "tiqets",
        apiRef: String(p.id ?? apiRef),
        category: "event",
        title: p.title ?? "Event",
        description: p.summary ?? p.description,
        imageUrl: p.image_url ?? gallery?.[0],
        price: p.price?.from,
        currency: p.price?.currency ?? "GBP",
        externalUrl: p.url,
        locationName: p.city,
        address: p.location?.address,
        coords: p.location?.latitude && p.location?.longitude
          ? { lat: p.location.latitude, lng: p.location.longitude }
          : undefined,
        rating: p.rating?.score,
        reviewCount: p.rating?.count,
        gallery,
        highlights: p.highlights ?? p.tags,
      };
    } catch (err) {
      console.error("[tiqets] getDetail failed", err);
      return null;
    }
  },
});
