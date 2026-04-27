import { v } from "convex/values";
import { action, internalQuery, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { DiscoveryDetail, DiscoveryItem } from "./providers/types";

const TTL_MS = 24 * 60 * 60 * 1000;
const DETAIL_TTL_MS = 60 * 60 * 1000;

type Provider = DiscoveryItem["provider"];

function providerFor(category: string): Provider {
  switch (category) {
    case "stay": return "liteapi";
    case "tour":
    case "adventure": return "viator";
    case "event": return "tiqets";
    case "eat": return "yelp";
    case "ride": return "rentalcars";
    case "fly": return "duffel";
    default: return "static";
  }
}

export const searchByCategory = action({
  args: {
    category: v.string(),
    term: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    limit: v.optional(v.number()),
    checkin: v.optional(v.string()),
    checkout: v.optional(v.string()),
    originIata: v.optional(v.string()),
    destinationIata: v.optional(v.string()),
    // Pass true from the client to bypass the 24h cache after a no-result
    // session, e.g. after a user has just set their home location.
    forceRefresh: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { category, term, lat, lng, limit, checkin, checkout, originIata, destinationIata, forceRefresh },
  ): Promise<DiscoveryItem[]> => {
    const cap = limit ?? 12;
    const coordsKey =
      lat !== undefined && lng !== undefined
        ? `@${lat.toFixed(3)},${lng.toFixed(3)}`
        : "";
    const dateKey = checkin && checkout ? `|${checkin}~${checkout}` : "";
    const iataKey = originIata || destinationIata
      ? `|iata=${originIata ?? ""}~${destinationIata ?? ""}`
      : "";
    // Bump CACHE_VERSION when changing item shape (e.g. URL rewrites) so
    // stale entries don't keep serving old data after a deploy.
    const CACHE_VERSION = "v4";
    const queryKey = `${term.trim().toLowerCase()}${coordsKey}${dateKey}${iataKey}|limit=${cap}|${CACHE_VERSION}`;
    const provider = providerFor(category);

    if (!forceRefresh) {
      const cached = await ctx.runQuery(internal.discovery.getCached, {
        provider, category, queryKey,
      });
      if (cached) return cached as DiscoveryItem[];
    }

    let items: DiscoveryItem[] = [];
    try {
      switch (provider) {
        case "viator":
          items = await ctx.runAction(internal.providers.viator.search, {
            category, term, lat, lng, limit: cap,
          });
          break;
        case "liteapi":
          items = await ctx.runAction(internal.providers.liteapi.search, {
            category, term, lat, lng, limit: cap, checkin, checkout,
          });
          break;
        case "duffel":
          items = await ctx.runAction(internal.providers.duffel.search, {
            category, term, lat, lng, limit: cap, checkin, checkout,
            originIata, destinationIata,
          });
          break;
        case "rentalcars":
          items = await ctx.runAction(internal.providers.rentalcars.search, {
            category, term, lat, lng, limit: cap, checkin, checkout,
          });
          break;
        case "tiqets":
          items = await ctx.runAction(internal.providers.tiqets.search, {
            category, term, lat, lng, limit: cap,
          });
          break;
        case "yelp":
          items = await ctx.runAction(internal.providers.yelp.search, {
            category, term, lat, lng, limit: cap,
          });
          break;
      }
    } catch (err) {
      console.error("[discovery] provider call threw", { category, error: String(err) });
    }

    if (items.length === 0) {
      items = await ctx.runAction(internal.providers.staticDiscovery.search, {
        category, term, lat, lng, limit: cap,
      });
    }

    // Only cache non-empty payloads. Caching `[]` for 24h means a transient
    // 401/network blip turns into a day of empty Discover chips.
    if (items.length > 0) {
      await ctx.runMutation(internal.discovery.setCache, {
        provider, category, queryKey, payload: items, ttlMs: TTL_MS,
      });
    }
    return items;
  },
});

// Run from the Convex dashboard or CLI to verify Viator wiring end-to-end.
// Returns counts + first item per category so you can confirm at a glance
// whether real data flows for Explore (tour) and Adventure.
//   npx convex run discovery:smokeTest '{"city":"London"}'
// Test /products/search with a literal destinationId.
//   npx convex run discovery:viatorProductsByDest '{"destId":"22639"}'
export const viatorProductsByDest = action({
  args: { destId: v.string() },
  handler: async (
    _ctx,
    { destId },
  ): Promise<{ status: number; bodyPreview: string; productCount: number }> => {
    const apiKey = process.env.VIATOR_KEY;
    const host =
      process.env.VIATOR_BASE_URL ??
      (process.env.VIATOR_ENV === "production"
        ? "https://api.viator.com/partner"
        : "https://api.sandbox.viator.com/partner");
    if (!apiKey) return { status: 0, bodyPreview: "no key", productCount: 0 };
    const res = await fetch(`${host}/products/search`, {
      method: "POST",
      headers: {
        "exp-api-key": apiKey,
        Accept: "application/json;version=2.0",
        "Accept-Language": "en-US",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filtering: { destination: destId },
        pagination: { start: 1, count: 4 },
        currency: "GBP",
      }),
    });
    const text = await res.text();
    let count = 0;
    try {
      const parsed = JSON.parse(text) as { products?: unknown[] };
      count = parsed.products?.length ?? 0;
    } catch {
      // not JSON
    }
    return { status: res.status, bodyPreview: text.slice(0, 600), productCount: count };
  },
});

// Inspect the URL fields a sandbox product carries so we can pick the
// right deep-link strategy.
//   npx convex run discovery:viatorProductDump '{"destId":"22639"}'
export const viatorProductDump = action({
  args: { destId: v.string() },
  handler: async (
    _ctx,
    { destId },
  ): Promise<{
    fields: Array<{ productCode: string; productUrl?: string; webURL?: string; bookingUrl?: string }>;
  }> => {
    const apiKey = process.env.VIATOR_KEY;
    const host =
      process.env.VIATOR_BASE_URL ??
      (process.env.VIATOR_ENV === "production"
        ? "https://api.viator.com/partner"
        : "https://api.sandbox.viator.com/partner");
    if (!apiKey) return { fields: [] };
    const res = await fetch(`${host}/products/search`, {
      method: "POST",
      headers: {
        "exp-api-key": apiKey,
        Accept: "application/json;version=2.0",
        "Accept-Language": "en-US",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filtering: { destination: destId },
        pagination: { start: 1, count: 3 },
        currency: "GBP",
      }),
    });
    const json = (await res.json()) as { products?: any[] };
    return {
      fields: (json.products ?? []).map((p) => ({
        productCode: p.productCode,
        productUrl: p.productUrl,
        webURL: p.webURL,
        bookingUrl: p.bookingUrl,
      })),
    };
  },
});

// Direct call to viator provider's internal search action.
//   npx convex run discovery:viatorInternalProbe '{"term":"Pittsburgh"}'
export const viatorInternalProbe = action({
  args: { term: v.string() },
  handler: async (
    ctx,
    { term },
  ): Promise<{ count: number; firstTitle?: string }> => {
    const items: DiscoveryItem[] = await ctx.runAction(
      internal.providers.viator.search,
      { category: "tour", term, limit: 4 },
    );
    return {
      count: items.length,
      firstTitle: items[0]?.title,
    };
  },
});

// Wipe the cached Viator destinations list. Force-refreshes next call.
//   npx convex run discovery:viatorClearDestinations
export const viatorClearDestinations = action({
  args: {},
  handler: async (ctx): Promise<{ cleared: boolean }> => {
    await ctx.runMutation(internal.discovery.setCache, {
      provider: "viator",
      category: "_destinations",
      queryKey:
        process.env.VIATOR_BASE_URL ??
        (process.env.VIATOR_ENV === "production"
          ? "https://api.viator.com/partner"
          : "https://api.sandbox.viator.com/partner"),
      payload: [],
      ttlMs: 0,
    });
    return { cleared: true };
  },
});

// Test if a city exists in Viator's destinations list.
//   npx convex run discovery:viatorCityProbe '{"city":"London"}'
export const viatorCityProbe = action({
  args: { city: v.string() },
  handler: async (
    _ctx,
    { city },
  ): Promise<{
    total: number;
    cityMatches: Array<{ destinationId: number; name: string; type: string }>;
    firstFew: Array<{ destinationId: number; name: string; type: string }>;
  }> => {
    const apiKey = process.env.VIATOR_KEY;
    const host =
      process.env.VIATOR_BASE_URL ??
      (process.env.VIATOR_ENV === "production"
        ? "https://api.viator.com/partner"
        : "https://api.sandbox.viator.com/partner");
    if (!apiKey) return { total: 0, cityMatches: [], firstFew: [] };
    const res = await fetch(`${host}/destinations`, {
      method: "GET",
      headers: {
        "exp-api-key": apiKey,
        Accept: "application/json;version=2.0",
        "Accept-Language": "en-US",
      },
    });
    const json = (await res.json()) as { destinations?: Array<{ destinationId: number; name: string; type: string }> };
    const all = json.destinations ?? [];
    const needle = city.trim().toLowerCase();
    const matches = all.filter((d) => d.name.toLowerCase().includes(needle));
    return {
      total: all.length,
      cityMatches: matches.slice(0, 5),
      firstFew: all.slice(0, 5),
    };
  },
});

// Probe Viator's destinations search to find the destinationId for a city.
//   npx convex run discovery:viatorDestProbe '{"term":"London"}'
export const viatorDestProbe = action({
  args: { term: v.string() },
  handler: async (
    _ctx,
    { term },
  ): Promise<{ host: string; status: number; bodyPreview: string }> => {
    const apiKey = process.env.VIATOR_KEY;
    const host =
      process.env.VIATOR_BASE_URL ??
      (process.env.VIATOR_ENV === "production"
        ? "https://api.viator.com/partner"
        : "https://api.sandbox.viator.com/partner");
    if (!apiKey) {
      return { host, status: 0, bodyPreview: "VIATOR_KEY not set" };
    }
    const res = await fetch(`${host}/destinations`, {
      method: "GET",
      headers: {
        "exp-api-key": apiKey,
        Accept: "application/json;version=2.0",
        "Accept-Language": "en-US",
      },
    });
    void term;
    const text = await res.text();
    return { host, status: res.status, bodyPreview: text.slice(0, 1000) };
  },
});

// Direct Viator probe: hits the Viator HTTP API itself so we see the raw
// response status + body, bypassing every layer of caching and fallback.
// Diagnostic only — call from CLI:
//   npx convex run discovery:viatorProbe '{"term":"London"}'
export const viatorProbe = action({
  args: { term: v.optional(v.string()) },
  handler: async (
    _ctx,
    { term },
  ): Promise<{
    host: string;
    status: number;
    bodyPreview: string;
    productCount: number;
    keyPresent: boolean;
  }> => {
    const apiKey = process.env.VIATOR_KEY;
    const host =
      process.env.VIATOR_BASE_URL ??
      (process.env.VIATOR_ENV === "production"
        ? "https://api.viator.com/partner"
        : "https://api.sandbox.viator.com/partner");
    if (!apiKey) {
      return { host, status: 0, bodyPreview: "VIATOR_KEY not set", productCount: 0, keyPresent: false };
    }
    const res = await fetch(`${host}/products/search`, {
      method: "POST",
      headers: {
        "exp-api-key": apiKey,
        Accept: "application/json;version=2.0",
        "Accept-Language": "en-US",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filtering: { searchTerm: term ?? "London" },
        pagination: { start: 1, count: 4 },
        currency: "GBP",
      }),
    });
    const text = await res.text();
    let count = 0;
    try {
      const parsed = JSON.parse(text) as { products?: unknown[] };
      count = parsed.products?.length ?? 0;
    } catch {
      // not JSON
    }
    return {
      host,
      status: res.status,
      bodyPreview: text.slice(0, 500),
      productCount: count,
      keyPresent: true,
    };
  },
});

export const smokeTest = action({
  args: { city: v.optional(v.string()) },
  handler: async (
    ctx,
    { city },
  ): Promise<Array<{ chip: string; provider: string; count: number; sample?: string }>> => {
    const term = city ?? "London";
    const chips: Array<[string, string]> = [
      ["explore", "tour"],
      ["adventure", "adventure"],
      ["do", "tour"],
    ];
    const out: Array<{ chip: string; provider: string; count: number; sample?: string }> = [];
    for (const [chip, cat] of chips) {
      const items: DiscoveryItem[] = await ctx.runAction(
        api.discovery.searchByCategory,
        { category: cat, term, limit: 6, forceRefresh: true },
      );
      out.push({
        chip,
        provider: items[0]?.provider ?? "(none)",
        count: items.length,
        sample: items[0]?.title,
      });
    }
    return out;
  },
});

export const getDetail = action({
  args: {
    provider: v.string(),
    apiRef: v.string(),
    category: v.string(),
  },
  handler: async (
    ctx,
    { provider, apiRef, category },
  ): Promise<DiscoveryDetail | null> => {
    const queryKey = `detail:${apiRef}`;
    const cached = await ctx.runQuery(internal.discovery.getCached, {
      provider, category, queryKey,
    });
    if (cached) return cached as DiscoveryDetail;

    let detail: DiscoveryDetail | null = null;
    try {
      switch (provider as Provider) {
        case "viator":
          detail = await ctx.runAction(internal.providers.viator.getDetail, { apiRef });
          break;
        case "liteapi":
          detail = await ctx.runAction(internal.providers.liteapi.getDetail, { apiRef });
          break;
        case "duffel":
          detail = await ctx.runAction(internal.providers.duffel.getDetail, { apiRef });
          break;
        case "rentalcars":
          detail = await ctx.runAction(internal.providers.rentalcars.getDetail, { apiRef });
          break;
        case "tiqets":
          detail = await ctx.runAction(internal.providers.tiqets.getDetail, { apiRef });
          break;
        case "yelp":
          detail = await ctx.runAction(internal.providers.yelp.getDetail, { apiRef });
          break;
        case "static":
          detail = await ctx.runAction(internal.providers.staticDiscovery.getDetail, { apiRef });
          break;
      }
    } catch (err) {
      console.error("[discovery] getDetail threw", { provider, error: String(err) });
    }

    if (!detail) {
      detail = await ctx.runAction(internal.providers.staticDiscovery.getDetail, { apiRef });
    }

    if (detail) {
      await ctx.runMutation(internal.discovery.setCache, {
        provider, category, queryKey, payload: detail, ttlMs: DETAIL_TTL_MS,
      });
    }
    return detail;
  },
});

export const getCached = internalQuery({
  args: { provider: v.string(), category: v.string(), queryKey: v.string() },
  handler: async (ctx, { provider, category, queryKey }) => {
    const row = await ctx.db
      .query("discovery_cache")
      .withIndex("by_key", q =>
        q.eq("provider", provider).eq("category", category).eq("queryKey", queryKey)
      )
      .first();
    if (!row || row.expiresAt < Date.now()) return null;
    return row.payload;
  },
});

export const setCache = internalMutation({
  args: {
    provider: v.string(),
    category: v.string(),
    queryKey: v.string(),
    payload: v.any(),
    ttlMs: v.optional(v.number()),
  },
  handler: async (ctx, { provider, category, queryKey, payload, ttlMs }) => {
    const existing = await ctx.db
      .query("discovery_cache")
      .withIndex("by_key", q =>
        q.eq("provider", provider).eq("category", category).eq("queryKey", queryKey)
      )
      .first();
    const expiresAt = Date.now() + (ttlMs ?? TTL_MS);
    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt, payload });
    } else {
      await ctx.db.insert("discovery_cache", { provider, category, queryKey, expiresAt, payload });
    }
  },
});
