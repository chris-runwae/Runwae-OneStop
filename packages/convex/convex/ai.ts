import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  action,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

export const createAiTripRequest = mutation({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    return await ctx.db.insert("ai_trips", {
      userId,
      prompt: args.prompt,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const setAiTripResult = internalMutation({
  args: {
    aiTripId: v.id("ai_trips"),
    result: v.optional(v.string()),
    tripId: v.optional(v.id("trips")),
    status: v.union(v.literal("complete"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.aiTripId, {
      result: args.result,
      tripId: args.tripId,
      status: args.status,
    });
  },
});

export const getMyAiTrips = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("ai_trips")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Placeholder action. Wire to a real LLM provider later.
export const generateTripPlan = action({
  args: { aiTripId: v.id("ai_trips") },
  handler: async (ctx, args) => {
    try {
      const stub = JSON.stringify({
        days: [],
        note: "AI generation not yet configured",
      });
      await ctx.runMutation(internal.ai.setAiTripResult, {
        aiTripId: args.aiTripId,
        result: stub,
        status: "complete",
      });
      return { ok: true as const };
    } catch (err) {
      await ctx.runMutation(internal.ai.setAiTripResult, {
        aiTripId: args.aiTripId,
        status: "failed",
      });
      throw err;
    }
  },
});
