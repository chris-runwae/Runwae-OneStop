import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

async function resolveUserId(ctx: { auth: any; db: any }): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Not authenticated");
  return userId;
}

export const getByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const polls = await ctx.db
      .query("trip_polls")
      .withIndex("by_trip", (q: any) => q.eq("tripId", tripId))
      .order("desc")
      .collect();

    return Promise.all(
      polls.map(async (poll: Doc<"trip_polls">) => {
        const options = await ctx.db
          .query("poll_options")
          .withIndex("by_poll", (q: any) => q.eq("pollId", poll._id))
          .collect();
        const votes = await ctx.db
          .query("poll_votes")
          .withIndex("by_poll", (q: any) => q.eq("pollId", poll._id))
          .collect();
        const counts: Record<string, number> = {};
        for (const v2 of votes) counts[v2.optionId] = (counts[v2.optionId] ?? 0) + 1;
        const author = await ctx.db.get(poll.createdByUserId);
        return {
          ...poll,
          author,
          totalVotes: votes.length,
          options: options.map((o: Doc<"poll_options">) => ({ ...o, voteCount: counts[o._id] ?? 0 })),
        };
      }),
    );
  },
});

export const vote = mutation({
  args: { pollId: v.id("trip_polls"), optionId: v.id("poll_options") },
  handler: async (ctx, { pollId, optionId }) => {
    const userId = await resolveUserId(ctx);
    const poll = await ctx.db.get(pollId);
    if (!poll) throw new Error("Poll not found");
    if (poll.status !== "open") throw new Error("Poll is closed");

    const existing = await ctx.db
      .query("poll_votes")
      .withIndex("by_poll_user", (q: any) => q.eq("pollId", pollId).eq("userId", userId))
      .collect();

    if (poll.type === "single_choice") {
      const same = existing.find((v2: Doc<"poll_votes">) => v2.optionId === optionId);
      if (same) return same._id;
      for (const v2 of existing) await ctx.db.delete(v2._id);
      return ctx.db.insert("poll_votes", { pollId, optionId, userId, createdAt: Date.now() });
    }

    if (existing.some((v2: Doc<"poll_votes">) => v2.optionId === optionId)) {
      return existing.find((v2: Doc<"poll_votes">) => v2.optionId === optionId)!._id;
    }
    return ctx.db.insert("poll_votes", { pollId, optionId, userId, createdAt: Date.now() });
  },
});

export const unvote = mutation({
  args: { pollId: v.id("trip_polls"), optionId: v.id("poll_options") },
  handler: async (ctx, { pollId, optionId }) => {
    const userId = await resolveUserId(ctx);
    const existing = await ctx.db
      .query("poll_votes")
      .withIndex("by_poll_user", (q: any) => q.eq("pollId", pollId).eq("userId", userId))
      .filter((q: any) => q.eq(q.field("optionId"), optionId))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const create = mutation({
  args: {
    tripId: v.id("trips"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("single_choice"), v.literal("multi_choice"), v.literal("ranked")),
    options: v.array(v.string()),
    closesAt: v.optional(v.number()),
    allowAddOptions: v.optional(v.boolean()),
    isAnonymous: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx);
    const pollId = await ctx.db.insert("trip_polls", {
      tripId: args.tripId,
      createdByUserId: userId,
      title: args.title,
      description: args.description,
      type: args.type,
      status: "open",
      closesAt: args.closesAt,
      allowAddOptions: args.allowAddOptions ?? false,
      isAnonymous: args.isAnonymous ?? false,
      createdAt: Date.now(),
    });
    for (const label of args.options) {
      await ctx.db.insert("poll_options", {
        pollId, label, addedByUserId: userId, createdAt: Date.now(),
      });
    }
    return pollId;
  },
});

export const openOptionsBySavedItems = query({
  args: { savedItemIds: v.array(v.id("saved_items")) },
  handler: async (ctx, { savedItemIds }) => {
    const out: Record<string, {
      pollId: Id<"trip_polls">;
      optionId: Id<"poll_options">;
      pollTitle: string;
      voteCount: number;
      totalVotes: number;
    }> = {};
    for (const savedItemId of savedItemIds) {
      const options = await ctx.db
        .query("poll_options")
        .withIndex("by_saved_item", (q: any) => q.eq("savedItemId", savedItemId))
        .collect();
      for (const opt of options) {
        const poll = await ctx.db.get(opt.pollId);
        if (!poll || poll.status !== "open") continue;
        const votes = await ctx.db
          .query("poll_votes")
          .withIndex("by_poll", (q: any) => q.eq("pollId", poll._id))
          .collect();
        const voteCount = votes.filter((v2: Doc<"poll_votes">) => v2.optionId === opt._id).length;
        const existing = out[savedItemId];
        if (!existing || poll.createdAt > 0 && voteCount > existing.voteCount) {
          out[savedItemId] = {
            pollId: poll._id,
            optionId: opt._id,
            pollTitle: poll.title,
            voteCount,
            totalVotes: votes.length,
          };
        }
      }
    }
    return out as Record<Id<"saved_items">, {
      pollId: Id<"trip_polls">;
      optionId: Id<"poll_options">;
      pollTitle: string;
      voteCount: number;
      totalVotes: number;
    }>;
  },
});

export const createForSavedItem = mutation({
  args: {
    tripId: v.id("trips"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("single_choice"), v.literal("multi_choice"), v.literal("ranked")),
    savedItemIds: v.array(v.id("saved_items")),
    closesAt: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx);
    if (args.savedItemIds.length < 2) {
      throw new Error("Need at least 2 saved items to create a poll.");
    }
    const pollId = await ctx.db.insert("trip_polls", {
      tripId: args.tripId,
      createdByUserId: userId,
      title: args.title,
      description: args.description,
      type: args.type,
      status: "open",
      closesAt: args.closesAt,
      allowAddOptions: false,
      isAnonymous: args.isAnonymous ?? false,
      createdAt: Date.now(),
    });
    for (const savedItemId of args.savedItemIds) {
      const saved = await ctx.db.get(savedItemId);
      if (!saved || saved.tripId !== args.tripId) continue;
      await ctx.db.insert("poll_options", {
        pollId,
        label: saved.title,
        addedByUserId: userId,
        savedItemId,
        createdAt: Date.now(),
      });
    }
    return pollId;
  },
});
