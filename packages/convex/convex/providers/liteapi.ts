import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { DiscoveryItem } from "./types";

export const search = internalAction({
  args: { category: v.string(), term: v.string(), limit: v.number() },
  handler: async (_ctx, { category, term, limit }): Promise<DiscoveryItem[]> => {
    const apiKey = process.env.LITEAPI_KEY;
    if (!apiKey) {
      console.warn("[liteapi] LITEAPI_KEY not set — returning empty");
      return [];
    }
    try {
      const url = new URL("https://api.liteapi.travel/v3.0/data/hotels");
      if (term) url.searchParams.set("destinationName", term);
      url.searchParams.set("limit", String(Math.min(limit, 12)));
      const res = await fetch(url.toString(), {
        headers: { "X-API-Key": apiKey, "Accept": "application/json" },
      });
      if (!res.ok) {
        console.warn("[liteapi] response not ok", res.status);
        return [];
      }
      const data = await res.json() as { data?: any[] };
      const hotels = data.data ?? [];
      return hotels.slice(0, limit).map((h: any) => ({
        provider: "liteapi" as const,
        apiRef: String(h.id ?? ""),
        category: "stay" as const,
        title: h.name ?? "Hotel",
        description: h.description?.slice(0, 200),
        imageUrl: h.main_photo ?? h.thumbnail,
        price: h.priceFrom,
        currency: h.currency ?? "USD",
        locationName: h.address,
        coords: h.latitude && h.longitude ? { lat: h.latitude, lng: h.longitude } : undefined,
        rating: h.rating,
      }));
    } catch (err) {
      console.error("[liteapi] fetch failed", err);
      return [];
    }
  },
});
