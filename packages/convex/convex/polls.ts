import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

async function resolveUserId(ctx: { auth: any; db: any }): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("email"), identity.email))
    .unique();
  if (!user) throw new Error("User not found");
  return user._id as Id<"users">;
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
