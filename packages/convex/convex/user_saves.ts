import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";

const CATEGORY = v.union(
  v.literal("hotel"),
  v.literal("flight"),
  v.literal("tour"),
  v.literal("activity"),
  v.literal("restaurant"),
  v.literal("event"),
  v.literal("destination"),
  v.literal("trip"),
  v.literal("other")
);

export const add = mutation({
  args: {
    category: CATEGORY,
    provider: v.string(),
    apiRef: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    locationName: v.optional(v.string()),
    coords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    externalUrl: v.optional(v.string()),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("user_saves")
      .withIndex("by_user_ref", (q) =>
        q.eq("userId", userId).eq("provider", args.provider).eq("apiRef", args.apiRef)
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("user_saves", {
      userId,
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { provider: v.string(), apiRef: v.string() },
  handler: async (ctx, { provider, apiRef }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const row = await ctx.db
      .query("user_saves")
      .withIndex("by_user_ref", (q) =>
        q.eq("userId", userId).eq("provider", provider).eq("apiRef", apiRef)
      )
      .first();
    if (row) await ctx.db.delete(row._id);
    return { ok: true };
  },
});

// Returns only the (provider, apiRef) keys of every save by the viewer, so
// Discover cards can render their heart state without re-fetching details.
export const listKeys = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [] as Array<{ provider: string; apiRef: string }>;
    const rows = await ctx.db
      .query("user_saves")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows.map((r) => ({ provider: r.provider, apiRef: r.apiRef }));
  },
});

// Full saves grouped by category, newest first within each group.
export const listGrouped = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [] as Array<never>;
    const rows = await ctx.db
      .query("user_saves")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    rows.sort((a, b) => b.createdAt - a.createdAt);
    return rows;
  },
});
