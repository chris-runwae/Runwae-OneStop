import { v } from "convex/values";
import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
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
    const queryKey = `${term.trim().toLowerCase()}${coordsKey}${dateKey}${iataKey}|limit=${cap}`;
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

    await ctx.runMutation(internal.discovery.setCache, {
      provider, category, queryKey, payload: items, ttlMs: TTL_MS,
    });
    return items;
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
