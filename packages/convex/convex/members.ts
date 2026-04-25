import { v } from "convex/values";
import { query } from "./_generated/server";

export const listByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
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
        user: await ctx.db.get(m.userId),
      })),
    );
  },
});
