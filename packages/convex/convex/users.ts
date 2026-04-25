import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    preferredCurrency: v.optional(v.string()),
    preferredTimezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db.get(userId);
    if (!existing) throw new Error("User not found");

    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.avatarUrl !== undefined) patch.avatarUrl = args.avatarUrl;
    if (args.preferredCurrency !== undefined)
      patch.preferredCurrency = args.preferredCurrency;
    if (args.preferredTimezone !== undefined)
      patch.preferredTimezone = args.preferredTimezone;

    if (existing.createdAt === undefined) patch.createdAt = Date.now();

    await ctx.db.patch(userId, patch);
    return await ctx.db.get(userId);
  },
});

// Schema has no `username` field. Resolving by `name` (unindexed filter).
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.username))
      .first();
  },
});
