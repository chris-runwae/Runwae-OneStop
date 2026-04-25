import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { DiscoveryItem } from "./types";

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
