import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// `hostSharePct` is the host's slice of `totalCommission`, NOT the platform
// commission rate on the booking total. Whole-number percent in [0, 100].
// Elsewhere in this file/codebase the column `splitPct` is overloaded — for
// direct inserts (bookings.ts) it records the platform commission rate; only
// `recordForBooking` interprets it as the host's share. The argument is
// renamed here so callers can't pass the wrong meaning.
export const recordForBooking = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    totalCommission: v.number(),
    hostSharePct: v.number(),
    currency: v.string(),
    eventId: v.optional(v.id("events")),
    hostId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (
      !Number.isFinite(args.hostSharePct) ||
      args.hostSharePct < 0 ||
      args.hostSharePct > 100
    ) {
      throw new Error(
        `hostSharePct must be in [0, 100], got ${args.hostSharePct}`,
      );
    }
    const hostShare = Math.round(
      args.totalCommission * (args.hostSharePct / 100),
    );
    const runwaeShare = args.totalCommission - hostShare;
    return await ctx.db.insert("commissions", {
      bookingId: args.bookingId,
      eventId: args.eventId,
      hostId: args.hostId,
      totalCommission: args.totalCommission,
      runwaeShare,
      hostShare,
      splitPct: args.hostSharePct,
      currency: args.currency,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const getHostEarnings = query({
  args: {
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      return { pending: 0, paid: 0, held: 0, commissions: [] };

    const all = await ctx.db
      .query("commissions")
      .withIndex("by_host", (q) => q.eq("hostId", userId))
      .collect();

    const commissions = all.filter((c) => {
      if (args.from !== undefined && c.createdAt < args.from) return false;
      if (args.to !== undefined && c.createdAt > args.to) return false;
      return true;
    });

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

export const getHostEventBreakdown = query({
  args: {
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const all = await ctx.db
      .query("commissions")
      .withIndex("by_host", (q) => q.eq("hostId", userId))
      .collect();
    const inWindow = all.filter((c) => {
      if (args.from !== undefined && c.createdAt < args.from) return false;
      if (args.to !== undefined && c.createdAt > args.to) return false;
      return true;
    });

    type Bucket = {
      eventId: Id<"events"> | null;
      pending: number;
      paid: number;
      held: number;
      currency: string;
    };
    const byEvent = new Map<string, Bucket>();
    for (const c of inWindow) {
      const key = c.eventId ?? "no-event";
      const cur = byEvent.get(key) ?? {
        eventId: c.eventId ?? null,
        pending: 0,
        paid: 0,
        held: 0,
        currency: c.currency,
      };
      if (c.status === "pending") cur.pending += c.hostShare;
      else if (c.status === "paid") cur.paid += c.hostShare;
      else if (c.status === "held") cur.held += c.hostShare;
      byEvent.set(key, cur);
    }

    const buckets = [...byEvent.values()];
    const events = await Promise.all(
      buckets.map((b) => (b.eventId ? ctx.db.get(b.eventId) : null))
    );
    return buckets.map((b, i) => ({
      ...b,
      eventName: events[i]?.name ?? null,
      total: b.pending + b.paid + b.held,
    }));
  },
});
