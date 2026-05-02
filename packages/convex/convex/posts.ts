import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { toPublicUserOtherOrNull } from "./lib/user_sanitize";

export const getById = query({
  args: { postId: v.id("trip_posts") },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get(postId);
    if (!post) return null;
    return {
      ...post,
      author: toPublicUserOtherOrNull(await ctx.db.get(post.createdByUserId)),
    };
  },
});

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
        author: toPublicUserOtherOrNull(await ctx.db.get(p.createdByUserId)),
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

export const update = mutation({
  args: {
    postId: v.id("trip_posts"),
    content: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.createdByUserId !== userId) {
      throw new Error("Only the author can edit this post");
    }
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.content !== undefined) patch.content = args.content;
    if (args.imageUrls !== undefined) patch.imageUrls = args.imageUrls;
    await ctx.db.patch(args.postId, patch);
    return { ok: true };
  },
});

export const remove = mutation({
  args: { postId: v.id("trip_posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const post = await ctx.db.get(args.postId);
    if (!post) return { ok: true };
    // Trip owners and editors can also delete posts (moderation).
    if (post.createdByUserId !== userId) {
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("tripId", post.tripId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();
      if (
        !membership ||
        (membership.role !== "owner" && membership.role !== "editor")
      ) {
        throw new Error("Not authorized to delete this post");
      }
    }
    await ctx.db.delete(args.postId);
    return { ok: true };
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
