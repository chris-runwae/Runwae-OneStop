import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireAdmin } from "../lib/admin";
import type { Doc, Id } from "../_generated/dataModel";

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

export const getPlatformOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const bookings = await ctx.db.query("bookings").take(5000);
    const confirmed = bookings.filter(
      (b) => b.status === "confirmed" || b.status === "completed"
    );
    const gmv = confirmed.reduce((s, b) => s + b.grossAmount, 0);
    const totalCommission = confirmed.reduce(
      (s, b) => s + b.commissionAmount,
      0
    );
    const bookingCount = confirmed.length;

    const events = await ctx.db.query("events").take(2000);
    const publishedEvents = events.filter((e) => e.status === "published");

    const users = await ctx.db.query("users").take(2000);
    const hostUsers = users.filter(
      (u) => u.isHost === true && !u.isSystemSentinel
    );

    return {
      gmv,
      totalCommission,
      bookingCount,
      eventCount: events.length,
      publishedEventCount: publishedEvents.length,
      userCount: users.filter((u) => !u.isSystemSentinel).length,
      hostCount: hostUsers.length,
    };
  },
});

export const getRevenueTimeseries = query({
  args: {
    from: v.number(),
    to: v.number(),
    bucket: v.union(v.literal("day"), v.literal("week")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const bookings = await ctx.db.query("bookings").take(5000);
    const inWindow = bookings.filter(
      (b) =>
        (b.status === "confirmed" || b.status === "completed") &&
        b.bookedAt >= args.from &&
        b.bookedAt <= args.to
    );

    const bucketMs = args.bucket === "day" ? DAY_MS : WEEK_MS;
    const buckets = new Map<number, { gross: number; commission: number; count: number }>();
    for (const b of inWindow) {
      const key = Math.floor(b.bookedAt / bucketMs) * bucketMs;
      const cur = buckets.get(key) ?? { gross: 0, commission: 0, count: 0 };
      cur.gross += b.grossAmount;
      cur.commission += b.commissionAmount;
      cur.count += 1;
      buckets.set(key, cur);
    }
    return [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([t, v]) => ({ t, ...v }));
  },
});

export const getHostLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = args.limit ?? 10;

    const commissions = await ctx.db.query("commissions").take(5000);
    const totals = new Map<Id<"users">, number>();
    for (const c of commissions) {
      if (!c.hostId) continue;
      totals.set(c.hostId, (totals.get(c.hostId) ?? 0) + c.hostShare);
    }

    const sorted = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const hosts = await Promise.all(sorted.map(([id]) => ctx.db.get(id)));
    return sorted.map(([id, total], i) => {
      const host = hosts[i] as Doc<"users"> | null;
      return {
        hostId: id,
        hostShareTotal: total,
        host: host
          ? { _id: host._id, name: host.name ?? null, email: host.email ?? null }
          : null,
      };
    });
  },
});
