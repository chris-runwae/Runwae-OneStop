import { v } from "convex/values";
import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import type { DiscoveryItem } from "./providers/types";

const TTL_MS = 24 * 60 * 60 * 1000;

function providerFor(category: string): "viator" | "liteapi" | "static" {
  switch (category) {
    case "stay": return "liteapi";
    case "tour":
    case "adventure":
    case "event": return "viator";
    default: return "static";
  }
}

export const searchByCategory = action({
  args: {
    category: v.string(),
    term: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, term, limit }): Promise<DiscoveryItem[]> => {
    const cap = limit ?? 12;
    const queryKey = `${term.trim().toLowerCase()}|limit=${cap}`;
    const provider = providerFor(category);

    const cached = await ctx.runQuery(internal.discovery.getCached, {
      provider, category, queryKey,
    });
    if (cached) return cached as DiscoveryItem[];

    let items: DiscoveryItem[] = [];
    try {
      if (provider === "viator") {
        items = await ctx.runAction(internal.providers.viator.search, { category, term, limit: cap });
      } else if (provider === "liteapi") {
        items = await ctx.runAction(internal.providers.liteapi.search, { category, term, limit: cap });
      }
    } catch (err) {
      console.error("[discovery] provider call threw", { category, error: String(err) });
    }

    if (items.length === 0) {
      items = await ctx.runAction(internal.providers.staticDiscovery.search, { category, term, limit: cap });
    }

    await ctx.runMutation(internal.discovery.setCache, {
      provider, category, queryKey, payload: items,
    });
    return items;
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
  },
  handler: async (ctx, { provider, category, queryKey, payload }) => {
    const existing = await ctx.db
      .query("discovery_cache")
      .withIndex("by_key", q =>
        q.eq("provider", provider).eq("category", category).eq("queryKey", queryKey)
      )
      .first();
    const expiresAt = Date.now() + TTL_MS;
    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt, payload });
    } else {
      await ctx.db.insert("discovery_cache", { provider, category, queryKey, expiresAt, payload });
    }
  },
});
