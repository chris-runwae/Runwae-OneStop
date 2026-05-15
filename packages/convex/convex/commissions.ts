import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/admin";
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
      return {
        pending: 0,
        held: 0,
        paid: 0,
        paid_out: 0,
        commissions: [],
      };

    const all = await ctx.db
      .query("commissions")
      .withIndex("by_host", (q) => q.eq("hostId", userId))
      .collect();

    const commissions = all.filter((c) => {
      if (c.status === "reversed") return false;
      if (args.from !== undefined && c.createdAt < args.from) return false;
      if (args.to !== undefined && c.createdAt > args.to) return false;
      return true;
    });

    let pending = 0,
      held = 0,
      paid = 0,
      paid_out = 0;
    for (const c of commissions) {
      if (c.status === "pending") pending += c.hostShare;
      else if (c.status === "held") held += c.hostShare;
      else if (c.status === "paid") paid += c.hostShare;
      else if (c.status === "paid_out") paid_out += c.hostShare;
    }
    return { pending, held, paid, paid_out, commissions };
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

// ── State transitions ────────────────────────────────────────────────────
//
// pending → held    : guest has checked out / flown. Cron runs daily.
// held → paid       : provider (LiteAPI/Duffel) has settled. Manual today —
//                     admin reconciles weekly settlement CSVs.
// paid → paid_out   : admin sent the bank transfer to the host. Manual.
// (any) → reversed  : booking was cancelled / refunded.

/**
 * Flip a single commission row to `held`. Internal — called by the cron
 * after the booking's checkout/departure has passed.
 */
export const markHeld = internalMutation({
  args: { commissionId: v.id("commissions") },
  handler: async (ctx, { commissionId }) => {
    const row = await ctx.db.get(commissionId);
    if (!row) throw new Error("Commission not found");
    if (row.status !== "pending") return; // idempotent
    await ctx.db.patch(commissionId, {
      status: "held",
      statusUpdatedAt: Date.now(),
    });
  },
});

/**
 * Reverse the commission row associated with a booking — used when the
 * booking is cancelled or refunded. Idempotent: re-running on an already
 * reversed row is a no-op.
 */
export const reverseForBooking = internalMutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, { bookingId }) => {
    const rows = await ctx.db
      .query("commissions")
      .withIndex("by_booking", (q) => q.eq("bookingId", bookingId))
      .collect();
    for (const row of rows) {
      if (row.status === "reversed") continue;
      await ctx.db.patch(row._id, {
        status: "reversed",
        statusUpdatedAt: Date.now(),
      });
    }
  },
});

/**
 * Admin marks a commission row as paid out to the host. Used after the
 * admin sends the bank transfer (manual MVP). Only allowed from `paid`
 * status — you can't mark out earnings that haven't settled.
 */
export const markPaidOut = mutation({
  args: { commissionId: v.id("commissions") },
  handler: async (ctx, { commissionId }) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(commissionId);
    if (!row) throw new Error("Commission not found");
    if (row.status !== "paid") {
      throw new Error(
        `Can only mark paid_out from status "paid", got "${row.status}"`,
      );
    }
    await ctx.db.patch(commissionId, {
      status: "paid_out",
      statusUpdatedAt: Date.now(),
    });
  },
});

/**
 * Admin marks a commission row as settled by the provider (LiteAPI /
 * Duffel). Reconciles a row from `held` to `paid`. Done by hand after
 * reading the provider's weekly payout report.
 */
export const markPaid = mutation({
  args: { commissionId: v.id("commissions") },
  handler: async (ctx, { commissionId }) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(commissionId);
    if (!row) throw new Error("Commission not found");
    if (row.status !== "held" && row.status !== "pending") {
      throw new Error(
        `Can only mark paid from "held" or "pending", got "${row.status}"`,
      );
    }
    await ctx.db.patch(commissionId, {
      status: "paid",
      statusUpdatedAt: Date.now(),
    });
  },
});

/**
 * List commission rows pending host payout — what the admin needs to
 * action. Sorted by oldest first so the longest-overdue payouts surface.
 */
export const listOwedHostPayouts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("commissions")
      .withIndex("by_status", (q) => q.eq("status", "paid"))
      .collect();
    const owed = rows.filter((r) => r.hostShare > 0 && r.hostId !== undefined);
    owed.sort((a, b) => a.createdAt - b.createdAt);

    type Group = {
      hostId: Id<"users">;
      hostName: string | null;
      currency: string;
      total: number;
      commissions: typeof owed;
    };
    const byHost = new Map<string, Group>();
    for (const r of owed) {
      const key = `${r.hostId}|${r.currency}`;
      const cur = byHost.get(key);
      if (cur) {
        cur.total += r.hostShare;
        cur.commissions.push(r);
      } else {
        const host = await ctx.db.get(r.hostId!);
        byHost.set(key, {
          hostId: r.hostId!,
          hostName: host?.name ?? null,
          currency: r.currency,
          total: r.hostShare,
          commissions: [r],
        });
      }
    }
    return [...byHost.values()];
  },
});
