import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { DiscoveryDetail, DiscoveryItem } from "./types";

export const search = internalAction({
  args: {
    category: v.string(),
    term: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    limit: v.number(),
  },
  // NOTE: Viator's /products/search is destinationId-based, not lat/lng-based.
  // We use `term` (the destination label resolved by Nominatim) as the search
  // string. Future improvement: resolve destinationLabel → Viator destinationId
  // via /taxonomy/destinations, then pass it as `destinations: [{ ref }]`.
  handler: async (_ctx, { category, term, limit }): Promise<DiscoveryItem[]> => {
    const apiKey = process.env.VIATOR_KEY;
    if (!apiKey) {
      console.warn("[viator] VIATOR_KEY not set — returning empty");
      return [];
    }
    try {
      const res = await fetch("https://api.viator.com/partner/products/search", {
        method: "POST",
        headers: {
          "exp-api-key": apiKey,
          "Accept": "application/json;version=2.0",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filtering: { searchTerm: term || category },
          pagination: { start: 1, count: Math.min(limit, 12) },
          sorting: { sort: "DEFAULT", order: "ASCENDING" },
          currency: "GBP",
        }),
      });
      if (!res.ok) {
        console.warn("[viator] response not ok", res.status);
        return [];
      }
      const data = await res.json() as { products?: any[] };
      const products = data.products ?? [];
      return products.slice(0, limit).map((p: any) => ({
        provider: "viator" as const,
        apiRef: p.productCode ?? "",
        category: category as DiscoveryItem["category"],
        title: p.title ?? "Untitled",
        description: p.shortDescription,
        imageUrl: p.images?.[0]?.url ?? p.images?.[0]?.variants?.[0]?.url,
        price: p.pricing?.summary?.fromPrice,
        currency: p.pricing?.currency,
        externalUrl: p.productUrl,
        rating: p.reviews?.combinedAverageRating,
      }));
    } catch (err) {
      console.error("[viator] fetch failed", err);
      return [];
    }
  },
});

export const getDetail = internalAction({
  args: { apiRef: v.string() },
  handler: async (_ctx, { apiRef }): Promise<DiscoveryDetail | null> => {
    const apiKey = process.env.VIATOR_KEY;
    if (!apiKey) return null;
    try {
      const res = await fetch(`https://api.viator.com/partner/products/${encodeURIComponent(apiRef)}`, {
        headers: {
          "exp-api-key": apiKey,
          Accept: "application/json;version=2.0",
        },
      });
      if (!res.ok) return null;
      const p = await res.json() as any;
      const gallery = Array.isArray(p.images)
        ? p.images.flatMap((img: any) => [img.url, ...(img.variants?.map((v2: any) => v2.url) ?? [])]).filter(Boolean).slice(0, 12)
        : undefined;
      return {
        provider: "viator",
        apiRef: String(p.productCode ?? apiRef),
        category: "tour",
        title: p.title ?? "Tour",
        description: p.description ?? p.shortDescription,
        imageUrl: p.images?.[0]?.url ?? gallery?.[0],
        price: p.pricing?.summary?.fromPrice,
        currency: p.pricing?.currency,
        externalUrl: p.productUrl,
        rating: p.reviews?.combinedAverageRating,
        reviewCount: p.reviews?.totalReviews,
        gallery,
        highlights: p.inclusions?.map((i: any) => i.otherDescription ?? i.description ?? i).filter(Boolean),
        duration: p.duration?.fixedDurationInMinutes
          ? `${p.duration.fixedDurationInMinutes} min`
          : p.duration?.description,
      };
    } catch (err) {
      console.error("[viator] getDetail failed", err);
      return null;
    }
  },
});
