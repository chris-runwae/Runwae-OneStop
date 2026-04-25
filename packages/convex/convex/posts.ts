import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const posts = await ctx.db
      .query("trip_posts")
      .withIndex("by_trip", q => q.eq("tripId", tripId))
      .order("desc")
      .collect();

    return Promise.all(
      posts.map(async p => ({
        ...p,
        author: await ctx.db.get(p.createdByUserId),
      })),
    );
  },
});

export const countBySavedItems = query({
  args: { savedItemIds: v.array(v.id("saved_items")) },
  handler: async (ctx, { savedItemIds }) => {
    const counts: Record<string, number> = {};
    for (const id of savedItemIds) {
      const rows = await ctx.db
        .query("trip_posts")
        .withIndex("by_saved_item", q => q.eq("savedItemId", id))
        .collect();
      counts[id] = rows.length;
    }
    return counts as Record<Id<"saved_items">, number>;
  },
});

export const create = mutation({
  args: {
    tripId: v.id("trips"),
    content: v.string(),
    imageUrls: v.optional(v.array(v.string())),
    savedItemId: v.optional(v.id("saved_items")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const now = Date.now();
    return ctx.db.insert("trip_posts", {
      tripId: args.tripId,
      createdByUserId: userId,
      content: args.content,
      imageUrls: args.imageUrls,
      savedItemId: args.savedItemId,
      createdAt: now,
      updatedAt: now,
    });
  },
});
