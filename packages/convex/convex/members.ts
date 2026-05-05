import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { toPublicUserOtherOrNull } from "./lib/user_sanitize";

export const listByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const trip = await ctx.db.get(tripId);
    if (!trip) return [];

    if (trip.visibility !== "public") {
      const userId = await getAuthUserId(ctx);
      if (userId === null) return [];
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", q => q.eq("tripId", tripId))
        .filter(q => q.eq(q.field("userId"), userId))
        .first();
      if (!membership) return [];
    }

    const memberships = await ctx.db
      .query("trip_members")
      .withIndex("by_trip", q => q.eq("tripId", tripId))
      .filter(q => q.eq(q.field("status"), "accepted"))
      .collect();

    return Promise.all(
      memberships.map(async m => ({
        _id: m._id,
        role: m.role,
        joinedAt: m.joinedAt,
        user: toPublicUserOtherOrNull(await ctx.db.get(m.userId)),
      })),
    );
  },
});
