import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { DiscoveryDetail, DiscoveryItem } from "./types";

// Geoapify Places — free key, 3k req/day. Used as a generic POI fallback
// when Viator returns nothing for a given destination (esp. small cities).
//
// Sign up: https://www.geoapify.com/places-api/
const GEOAPIFY_BASE = "https://api.geoapify.com/v2";

// Map our app categories to Geoapify category strings.
function geoapifyCategoriesFor(appCategory: string): string {
  switch (appCategory) {
    case "tour":
    case "explore":
      return "tourism.attraction,tourism.sights,heritage";
    case "adventure":
      return "natural,leisure.park,sport";
    case "eat":
      return "catering.restaurant,catering.cafe";
    case "stay":
      return "accommodation.hotel,accommodation.hostel";
    default:
      return "tourism";
  }
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
    { category, lat, lng, limit }
  ): Promise<DiscoveryItem[]> => {
    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
      console.warn("[geoapify] GEOAPIFY_API_KEY not set");
      return [];
    }
    if (lat === undefined || lng === undefined) {
      // Geoapify requires either bias coords or a place rect; without coords
      // we can't reliably scope the search. Bail out — caller should pass
      // destination.coords from the destinations table.
      return [];
    }

    const url = new URL(`${GEOAPIFY_BASE}/places`);
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("categories", geoapifyCategoriesFor(category));
    url.searchParams.set(
      "filter",
      `circle:${lng},${lat},10000` // 10km radius
    );
    url.searchParams.set("bias", `proximity:${lng},${lat}`);
    url.searchParams.set("limit", String(Math.min(limit, 20)));

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        console.warn("[geoapify] places not ok", res.status);
        return [];
      }
      const json = (await res.json()) as {
        features?: Array<{
          properties?: {
            place_id?: string;
            name?: string;
            address_line1?: string;
            address_line2?: string;
            categories?: string[];
            datasource?: { raw?: { wikipedia?: string } };
            lat?: number;
            lon?: number;
            website?: string;
          };
        }>;
      };
      const features = json.features ?? [];
      return features
        .filter((f) => f.properties?.name)
        .slice(0, limit)
        .map((f): DiscoveryItem => {
          const p = f.properties!;
          return {
            provider: "geoapify",
            apiRef: p.place_id ?? `${p.lat},${p.lon}`,
            category: category as DiscoveryItem["category"],
            title: p.name!,
            description: p.address_line2 ?? p.categories?.join(" · "),
            locationName: p.address_line1,
            coords:
              p.lat !== undefined && p.lon !== undefined
                ? { lat: p.lat, lng: p.lon }
                : undefined,
            externalUrl: p.website,
          };
        });
    } catch (err) {
      console.error("[geoapify] fetch failed", err);
      return [];
    }
  },
});

// Place details endpoint — best effort; Geoapify exposes details by place_id
// but the surface is thinner than Viator's.
export const getDetail = internalAction({
  args: { apiRef: v.string() },
  handler: async (_ctx, { apiRef }): Promise<DiscoveryDetail | null> => {
    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) return null;
    try {
      const url = new URL(`${GEOAPIFY_BASE}/place-details`);
      url.searchParams.set("apiKey", apiKey);
      url.searchParams.set("id", apiRef);
      const res = await fetch(url.toString());
      if (!res.ok) return null;
      const json = (await res.json()) as {
        features?: Array<{
          properties?: {
            place_id?: string;
            name?: string;
            address_line1?: string;
            address_line2?: string;
            description?: string;
            website?: string;
            categories?: string[];
            lat?: number;
            lon?: number;
          };
        }>;
      };
      const p = json.features?.[0]?.properties;
      if (!p) return null;
      return {
        provider: "geoapify",
        apiRef: p.place_id ?? apiRef,
        category: "tour",
        title: p.name ?? "Place",
        description: p.description ?? p.address_line2,
        externalUrl: p.website,
        address: p.address_line1,
        coords:
          p.lat !== undefined && p.lon !== undefined
            ? { lat: p.lat, lng: p.lon }
            : undefined,
        highlights: p.categories,
      };
    } catch (err) {
      console.error("[geoapify] getDetail failed", err);
      return null;
    }
  },
});
