import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";

export const listPublished = query({
  args: {
    destinationId: v.optional(v.id("destinations")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.destinationId) {
      const destinationId = args.destinationId;
      const rows = await ctx.db
        .query("events")
        .withIndex("by_destination", (q) =>
          q.eq("destinationId", destinationId)
        )
        .collect();
      return rows
        .filter((e) => e.status === "published")
        .sort((a, b) => a.startDateUtc - b.startDateUtc)
        .slice(0, limit);
    }
    const all = await ctx.db.query("events").collect();
    return all
      .filter((e) => e.status === "published")
      .sort((a, b) => a.startDateUtc - b.startDateUtc)
      .slice(0, limit);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!event) return null;

    const tiers = await ctx.db
      .query("event_ticket_tiers")
      .withIndex("by_event", (q) => q.eq("eventId", event._id))
      .collect();
    const hosts = await ctx.db
      .query("event_hosts")
      .withIndex("by_event", (q) => q.eq("eventId", event._id))
      .collect();

    return { event, tiers, hosts };
  },
});

export const incrementViewCount = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return;
    await ctx.db.patch(args.eventId, { viewCount: event.viewCount + 1 });
  },
});

export const rsvp = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(
      v.literal("interested"),
      v.literal("going"),
      v.literal("not_going")
    ),
    tripId: v.optional(v.id("trips")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("event_attendees")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const now = Date.now();
    if (existing) {
      const wasGoing = existing.status === "going";
      const nowGoing = args.status === "going";
      await ctx.db.patch(existing._id, {
        status: args.status,
        tripId: args.tripId ?? existing.tripId,
      });
      if (wasGoing !== nowGoing) {
        await ctx.db.patch(args.eventId, {
          currentParticipants:
            event.currentParticipants + (nowGoing ? 1 : -1),
        });
      }
      return existing._id;
    }

    const attendeeId = await ctx.db.insert("event_attendees", {
      eventId: args.eventId,
      userId,
      tripId: args.tripId,
      status: args.status,
      createdAt: now,
    });
    if (args.status === "going") {
      await ctx.db.patch(args.eventId, {
        currentParticipants: event.currentParticipants + 1,
      });
    }
    return attendeeId;
  },
});

export const listAttendees = query({
  args: {
    eventId: v.id("events"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 8;
    const rows = await ctx.db
      .query("event_attendees")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    const going = rows.filter((r) => r.status === "going").slice(0, limit);
    const users = await Promise.all(
      going.map(async (r) => {
        const u = await ctx.db.get(r.userId);
        if (!u) return null;
        return { _id: u._id, name: u.name, image: u.image };
      })
    );
    return users.filter((u): u is NonNullable<typeof u> => u !== null);
  },
});

export const getViewerRsvp = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const row = await ctx.db
      .query("event_attendees")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    return row?.status ?? null;
  },
});
