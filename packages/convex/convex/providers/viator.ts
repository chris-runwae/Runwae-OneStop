import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { DiscoveryDetail, DiscoveryItem } from "./types";

// Viator has two hosts. Basic Affiliate (free) keys ONLY work against
// sandbox; production hits 401. Full+ Affiliate keys can use either.
//   sandbox:    https://api.sandbox.viator.com/partner
//   production: https://api.viator.com/partner
// Default to sandbox so Basic keys work out of the box; opt into production
// by setting VIATOR_BASE_URL or VIATOR_ENV=production on the Convex
// dashboard once you have a production key.
const VIATOR_BASE_URL =
  process.env.VIATOR_BASE_URL ??
  (process.env.VIATOR_ENV === "production"
    ? "https://api.viator.com/partner"
    : "https://api.sandbox.viator.com/partner");

const DESTINATIONS_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

type ViatorDest = {
  destinationId: number;
  name: string;
  type: string;
  parentDestinationId?: number;
  lookupId?: string;
  center?: { latitude: number; longitude: number };
};

async function loadDestinations(ctx: any, apiKey: string): Promise<ViatorDest[]> {
  const cached = (await ctx.runQuery(internal.discovery.getCached, {
    provider: "viator",
    category: "_destinations",
    queryKey: VIATOR_BASE_URL,
  })) as ViatorDest[] | null;
  if (cached && cached.length > 0) return cached;

  const res = await fetch(`${VIATOR_BASE_URL}/destinations`, {
    method: "GET",
    headers: {
      "exp-api-key": apiKey,
      Accept: "application/json;version=2.0",
      "Accept-Language": "en-US",
    },
  });
  if (!res.ok) {
    console.warn("[viator] /destinations not ok", res.status);
    return [];
  }
  const json = (await res.json()) as { destinations?: any[] };
  const raw = json.destinations ?? [];
  // The full /destinations payload (~1.08MB) exceeds Convex's 1MB document
  // limit. Strip to only the fields we need for resolution before caching.
  const slim: ViatorDest[] = raw.map((d) => ({
    destinationId: d.destinationId,
    name: d.name,
    type: d.type,
    parentDestinationId: d.parentDestinationId,
    lookupId: d.lookupId,
    center: d.center
      ? { latitude: d.center.latitude, longitude: d.center.longitude }
      : undefined,
  }));
  if (slim.length === 0) return slim;

  await ctx.runMutation(internal.discovery.setCache, {
    provider: "viator",
    category: "_destinations",
    queryKey: VIATOR_BASE_URL,
    payload: slim,
    ttlMs: DESTINATIONS_TTL_MS,
  });
  return slim;
}

// Viator returns product URLs against `shop.live.rc.viator.com` — a sandbox-
// mock storefront that lands on a search page instead of the product. The
// real product detail page lives on `www.viator.com` at the same path.
// We rewrite the host while preserving the affiliate tracking params
// (mcid/pid/medium/api_version) so commission still attributes correctly.
// Pick the highest-resolution image URL from a Viator product's `images`
// payload. Each image has variants sorted small→large; we want the largest
// available so the cover doesn't render as a 100×100 thumbnail.
function pickBestViatorImage(images: any[] | undefined): string | undefined {
  if (!Array.isArray(images) || images.length === 0) return undefined;
  // Prefer an image flagged as cover; else the first.
  const primary = images.find((i) => i?.isCover) ?? images[0];
  const variants = primary?.variants;
  if (Array.isArray(variants) && variants.length > 0) {
    // Sort by width desc and take the widest with a usable url.
    const widest = [...variants]
      .filter((v) => v?.url)
      .sort((a, b) => (b?.width ?? 0) - (a?.width ?? 0))[0];
    if (widest?.url) return widest.url;
  }
  return primary?.url ?? variants?.[variants.length - 1]?.url;
}

function rewriteViatorUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (
      u.hostname === "shop.live.rc.viator.com" ||
      u.hostname.endsWith(".rc.viator.com")
    ) {
      u.hostname = "www.viator.com";
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

function pickDestination(
  destinations: ViatorDest[],
  term: string,
  coords?: { lat?: number; lng?: number }
): ViatorDest | null {
  const needle = term.trim().toLowerCase();
  if (needle) {
    // Prefer an exact match on city name
    const exact = destinations.find(
      (d) => d.name.toLowerCase() === needle && d.type === "CITY"
    );
    if (exact) return exact;
    // Fallback: any exact match regardless of type
    const exactAny = destinations.find((d) => d.name.toLowerCase() === needle);
    if (exactAny) return exactAny;
    // Substring match on city
    const substr = destinations.find(
      (d) => d.name.toLowerCase().includes(needle) && d.type === "CITY"
    );
    if (substr) return substr;
  }
  if (coords?.lat !== undefined && coords?.lng !== undefined) {
    let best: { d: ViatorDest; km: number } | null = null;
    for (const d of destinations) {
      if (!d.center) continue;
      const dLat = d.center.latitude - coords.lat;
      const dLng = d.center.longitude - coords.lng;
      const km = Math.sqrt(dLat * dLat + dLng * dLng) * 111; // rough
      if (!best || km < best.km) best = { d, km };
    }
    if (best && best.km < 200) return best.d;
  }
  return null;
}

export const search = internalAction({
  args: {
    category: v.string(),
    term: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    limit: v.number(),
  },
  // Viator v2.0 /products/search requires `filtering.destination` (a
  // destinationId from /destinations), not a free-text search term. We
  // resolve `term` → destinationId once via the cached destinations list,
  // then pass it through.
  handler: async (
    ctx,
    { category, term, lat, lng, limit },
  ): Promise<DiscoveryItem[]> => {
    const apiKey = process.env.VIATOR_KEY;
    if (!apiKey) {
      console.warn("[viator] VIATOR_KEY not set — returning empty");
      return [];
    }

    const destinations = await loadDestinations(ctx, apiKey);
    if (destinations.length === 0) return [];

    const dest = pickDestination(destinations, term, { lat, lng });
    if (!dest) {
      console.warn(`[viator] no destinationId resolved for term "${term}"`);
      return [];
    }

    try {
      const res = await fetch(`${VIATOR_BASE_URL}/products/search`, {
        method: "POST",
        headers: {
          "exp-api-key": apiKey,
          Accept: "application/json;version=2.0",
          "Accept-Language": "en-US",
          "Content-Type": "application/json",
        },
        // Viator rejects `{ sort: "DEFAULT", order: ASCENDING }` with 400.
        // For default relevance ranking, omit `sorting` entirely.
        body: JSON.stringify({
          filtering: { destination: String(dest.destinationId) },
          pagination: { start: 1, count: Math.min(limit, 12) },
          currency: "GBP",
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.warn("[viator] /products/search not ok", res.status, body.slice(0, 200));
        if (res.status === 401) {
          console.warn(
            "[viator] 401 — Basic Affiliate keys only work on sandbox. " +
              `Current host: ${VIATOR_BASE_URL}. ` +
              "Set VIATOR_ENV=production once you have a Full+ key."
          );
        }
        return [];
      }
      const data = (await res.json()) as { products?: any[] };
      const products = data.products ?? [];
      return products.slice(0, limit).map((p: any) => ({
        provider: "viator" as const,
        apiRef: p.productCode ?? "",
        category: category as DiscoveryItem["category"],
        title: p.title ?? "Untitled",
        description: p.shortDescription,
        // Viator returns `images[0]` ~100×100 thumbnail. The `variants` array
        // is sorted small→large, so the *last* variant is the highest-res
        // (typically 1920×1280). Use it whenever present; otherwise fall
        // back to the parent url, then any variant we can find.
        imageUrl: pickBestViatorImage(p.images),
        price: p.pricing?.summary?.fromPrice,
        currency: p.pricing?.currency,
        externalUrl: rewriteViatorUrl(p.productUrl),
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
      const res = await fetch(
        `${VIATOR_BASE_URL}/products/${encodeURIComponent(apiRef)}`,
        {
          headers: {
            "exp-api-key": apiKey,
            Accept: "application/json;version=2.0",
            "Accept-Language": "en-US",
          },
        },
      );
      if (!res.ok) {
        if (res.status === 401) {
          console.warn(
            "[viator] getDetail 401 — Basic Affiliate keys only work on sandbox. " +
              `Current host: ${VIATOR_BASE_URL}.`
          );
        }
        return null;
      }
      const p = await res.json() as any;
      // Build a gallery of largest variants per image for the detail page.
      const gallery = Array.isArray(p.images)
        ? p.images
            .map((img: any) => {
              const variants = Array.isArray(img?.variants)
                ? [...img.variants].sort(
                    (a: any, b: any) => (b?.width ?? 0) - (a?.width ?? 0)
                  )
                : [];
              return variants[0]?.url ?? img?.url;
            })
            .filter(Boolean)
            .slice(0, 12)
        : undefined;
      return {
        provider: "viator",
        apiRef: String(p.productCode ?? apiRef),
        category: "tour",
        title: p.title ?? "Tour",
        description: p.description ?? p.shortDescription,
        imageUrl: pickBestViatorImage(p.images) ?? gallery?.[0],
        price: p.pricing?.summary?.fromPrice,
        currency: p.pricing?.currency,
        externalUrl: rewriteViatorUrl(p.productUrl),
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
