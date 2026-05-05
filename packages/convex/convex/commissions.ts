import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, query } from "./_generated/server";

export const recordForBooking = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    totalCommission: v.number(),
    splitPct: v.number(),
    currency: v.string(),
    eventId: v.optional(v.id("events")),
    hostId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const hostShare = Math.round(args.totalCommission * args.splitPct) / 1;
    const runwaeShare = args.totalCommission - hostShare;
    return await ctx.db.insert("commissions", {
      bookingId: args.bookingId,
      eventId: args.eventId,
      hostId: args.hostId,
      totalCommission: args.totalCommission,
      runwaeShare,
      hostShare,
      splitPct: args.splitPct,
      currency: args.currency,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const getHostEarnings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { pending: 0, paid: 0, held: 0, commissions: [] };

    const commissions = await ctx.db
      .query("commissions")
      .withIndex("by_host", (q) => q.eq("hostId", userId))
      .collect();

    let pending = 0,
      paid = 0,
      held = 0;
    for (const c of commissions) {
      if (c.status === "pending") pending += c.hostShare;
      else if (c.status === "paid") paid += c.hostShare;
      else if (c.status === "held") held += c.hostShare;
    }
    return { pending, paid, held, commissions };
  },
});
