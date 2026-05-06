import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireHost } from "../lib/host";

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
