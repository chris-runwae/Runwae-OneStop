import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireHost } from "../lib/host";
import type { Id } from "../_generated/dataModel";

const PERIOD = v.union(
  v.literal("this_month"),
  v.literal("last_month"),
  v.literal("last_3_months"),
  v.literal("this_year")
);
type Period = "this_month" | "last_month" | "last_3_months" | "this_year";

function periodBounds(period: Period, now = Date.now()) {
  const d = new Date(now);
  const startOf = (yyyy: number, mm: number, dd = 1) =>
    Date.UTC(yyyy, mm, dd, 0, 0, 0, 0);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  switch (period) {
    case "this_month": {
      const start = startOf(y, m);
      const end = startOf(y, m + 1);
      const prevStart = startOf(y, m - 1);
      const prevEnd = start;
      return { start, end, prevStart, prevEnd };
    }
    case "last_month": {
      const start = startOf(y, m - 1);
      const end = startOf(y, m);
      const prevStart = startOf(y, m - 2);
      const prevEnd = start;
      return { start, end, prevStart, prevEnd };
    }
    case "last_3_months": {
      const start = startOf(y, m - 2);
      const end = startOf(y, m + 1);
      const prevStart = startOf(y, m - 5);
      const prevEnd = start;
      return { start, end, prevStart, prevEnd };
    }
    case "this_year": {
      const start = startOf(y, 0);
      const end = startOf(y + 1, 0);
      const prevStart = startOf(y - 1, 0);
      const prevEnd = start;
      return { start, end, prevStart, prevEnd };
    }
  }
}

export const getMyOverview = query({
  args: {},
  handler: async (ctx) => {
    const host = await requireHost(ctx);

    const events = await ctx.db
      .query("events")
      .withIndex("by_host", (q) => q.eq("hostUserId", host._id))
      .collect();
    const now = Date.now();
    const upcoming = events.filter(
      (e) => e.status === "published" && e.startDateUtc >= now
    ).length;
    const drafts = events.filter((e) => e.status === "draft").length;
    const totalViews = events.reduce((s, e) => s + e.viewCount, 0);
    const totalParticipants = events.reduce(
      (s, e) => s + e.currentParticipants,
      0
    );

    const commissions = await ctx.db
      .query("commissions")
      .withIndex("by_host", (q) => q.eq("hostId", host._id))
      .collect();
    const grossEarnings = commissions.reduce((s, c) => s + c.hostShare, 0);
    const pendingEarnings = commissions
      .filter((c) => c.status === "pending")
      .reduce((s, c) => s + c.hostShare, 0);

    return {
      eventCount: events.length,
      upcomingEvents: upcoming,
      draftEvents: drafts,
      totalViews,
      totalParticipants,
      grossEarnings,
      pendingEarnings,
    };
  },
});

// Time-series of event_views counts for a host's events.
// scope: "all" → all events the host owns; or a single eventId.
// range drives bucket width: this_month/last_month → daily; last_3_months → weekly; this_year → monthly.
export const getViewsTimeSeries = query({
  args: {
    scope: v.union(v.literal("all"), v.object({ eventId: v.id("events") })),
    range: PERIOD,
  },
  handler: async (ctx, args) => {
    const host = await requireHost(ctx);

    let eventIds: Id<"events">[];
    if (args.scope === "all") {
      const rows = await ctx.db
        .query("events")
        .withIndex("by_host", (q) => q.eq("hostUserId", host._id))
        .collect();
      eventIds = rows.map((r) => r._id);
    } else {
      const ev = await ctx.db.get(args.scope.eventId);
      if (!ev || ev.hostUserId !== host._id) return { buckets: [], total: 0 };
      eventIds = [ev._id];
    }

    if (eventIds.length === 0) return { buckets: [], total: 0 };

    const { start, end } = periodBounds(args.range);

    let total = 0;
    const buckets = new Map<string, number>();

    for (const eventId of eventIds) {
      const views = await ctx.db
        .query("event_views")
        .withIndex("by_event_ts", (q) =>
          q.eq("eventId", eventId).gte("ts", start).lt("ts", end)
        )
        .collect();
      for (const view of views) {
        total += 1;
        const key = bucketKey(view.ts, args.range);
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    }

    const ordered = enumerateBuckets(start, end, args.range).map((key) => ({
      bucket: key,
      label: formatBucketLabel(key, args.range),
      views: buckets.get(key) ?? 0,
    }));

    return { buckets: ordered, total };
  },
});

function bucketKey(ts: number, range: Period): string {
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const dd = d.getUTCDate();
  if (range === "this_year") return `${y}-${String(m + 1).padStart(2, "0")}`;
  if (range === "last_3_months") {
    // ISO week-ish: bucket by week-start (Monday) UTC
    const ws = startOfWeekUtc(ts);
    const wd = new Date(ws);
    return `${wd.getUTCFullYear()}-${String(wd.getUTCMonth() + 1).padStart(2, "0")}-${String(wd.getUTCDate()).padStart(2, "0")}`;
  }
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

function startOfWeekUtc(ts: number): number {
  const d = new Date(ts);
  const dow = d.getUTCDay(); // 0=Sun
  const offset = (dow + 6) % 7; // days since Monday
  return Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate() - offset
  );
}

function enumerateBuckets(start: number, end: number, range: Period): string[] {
  const out: string[] = [];
  if (range === "this_year") {
    const sd = new Date(start);
    let y = sd.getUTCFullYear();
    let m = sd.getUTCMonth();
    while (Date.UTC(y, m, 1) < end) {
      out.push(`${y}-${String(m + 1).padStart(2, "0")}`);
      m += 1;
      if (m === 12) {
        m = 0;
        y += 1;
      }
    }
    return out;
  }
  if (range === "last_3_months") {
    let cursor = startOfWeekUtc(start);
    while (cursor < end) {
      const d = new Date(cursor);
      out.push(
        `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
      );
      cursor += 7 * 24 * 60 * 60 * 1000;
    }
    return out;
  }
  // daily
  let cursor = start;
  while (cursor < end) {
    const d = new Date(cursor);
    out.push(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
    );
    cursor += 24 * 60 * 60 * 1000;
  }
  return out;
}

function formatBucketLabel(key: string, range: Period): string {
  if (range === "this_year") {
    const [, m] = key.split("-");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return months[parseInt(m, 10) - 1] ?? key;
  }
  // both daily and weekly: "MMM D"
  const [, m, d] = key.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

// Same shape as getMyOverview, but adds previous-period totals so the KPI
// cards can render trend deltas in one round-trip.
export const getMyOverviewWithTrends = query({
  args: { period: v.optional(PERIOD) },
  handler: async (ctx, args) => {
    const host = await requireHost(ctx);
    const period: Period = args.period ?? "this_month";
    const { start, end, prevStart, prevEnd } = periodBounds(period);

    const events = await ctx.db
      .query("events")
      .withIndex("by_host", (q) => q.eq("hostUserId", host._id))
      .collect();

    const now = Date.now();
    const upcoming = events.filter(
      (e) => e.status === "published" && e.startDateUtc >= now
    ).length;
    const drafts = events.filter((e) => e.status === "draft").length;

    // Period-bounded views (from event_views) and bookings.
    let viewsCurrent = 0;
    let viewsPrev = 0;
    for (const e of events) {
      const cur = await ctx.db
        .query("event_views")
        .withIndex("by_event_ts", (q) =>
          q.eq("eventId", e._id).gte("ts", start).lt("ts", end)
        )
        .collect();
      const prev = await ctx.db
        .query("event_views")
        .withIndex("by_event_ts", (q) =>
          q.eq("eventId", e._id).gte("ts", prevStart).lt("ts", prevEnd)
        )
        .collect();
      viewsCurrent += cur.length;
      viewsPrev += prev.length;
    }

    let bookingsCurrent = 0;
    let bookingsPrev = 0;
    for (const e of events) {
      const rows = await ctx.db
        .query("bookings")
        .withIndex("by_event", (q) => q.eq("eventId", e._id))
        .collect();
      for (const b of rows) {
        if (b.bookedAt >= start && b.bookedAt < end) bookingsCurrent += 1;
        else if (b.bookedAt >= prevStart && b.bookedAt < prevEnd)
          bookingsPrev += 1;
      }
    }

    // Trip-plans = itinerary items the host's user owns. Falls back to 0
    // if the table doesn't have an index by user — we'll keep this cheap
    // for now and refine once we wire actual trip-plan instrumentation.
    const tripPlansCurrent = 0;
    const tripPlansPrev = 0;

    const totalViewsAllTime = events.reduce((s, e) => s + e.viewCount, 0);
    const totalParticipants = events.reduce(
      (s, e) => s + e.currentParticipants,
      0
    );

    const commissions = await ctx.db
      .query("commissions")
      .withIndex("by_host", (q) => q.eq("hostId", host._id))
      .collect();
    const grossEarnings = commissions.reduce((s, c) => s + c.hostShare, 0);
    const pendingEarnings = commissions
      .filter((c) => c.status === "pending")
      .reduce((s, c) => s + c.hostShare, 0);

    return {
      period,
      eventCount: events.length,
      upcomingEvents: upcoming,
      draftEvents: drafts,
      totalViewsAllTime,
      totalParticipants,
      grossEarnings,
      pendingEarnings,
      cards: {
        views: { current: viewsCurrent, previous: viewsPrev },
        bookings: { current: bookingsCurrent, previous: bookingsPrev },
        tripPlans: { current: tripPlansCurrent, previous: tripPlansPrev },
      },
    };
  },
});

export const getEventInsights = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const host = await requireHost(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    if (event.hostUserId !== host._id) return null;

    const attendees = await ctx.db
      .query("event_attendees")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    const tickets = await ctx.db
      .query("event_tickets")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const interested = attendees.filter((a) => a.status === "interested").length;
    const going = attendees.filter((a) => a.status === "going").length;
    const notGoing = attendees.filter((a) => a.status === "not_going").length;
    const ticketsActive = tickets.filter((t) => t.status === "active").length;
    const ticketsUsed = tickets.filter((t) => t.status === "used").length;

    return {
      viewCount: event.viewCount,
      currentParticipants: event.currentParticipants,
      funnel: { interested, going, notGoing },
      tickets: {
        total: tickets.length,
        active: ticketsActive,
        used: ticketsUsed,
        cancelled: tickets.filter((t) => t.status === "cancelled").length,
      },
    };
  },
});
