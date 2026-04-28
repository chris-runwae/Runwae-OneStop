import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, internalMutation } from "./_generated/server";

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
    const viewerId = await getAuthUserId(ctx);

    const rows = await ctx.db
      .query("event_attendees")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    const going = rows.filter((r) => r.status === "going");

    // Resolve friend ids of the viewer (if any) so we can prioritise them.
    let friendIds = new Set<string>();
    if (viewerId !== null) {
      const outgoing = await ctx.db
        .query("friendships")
        .withIndex("by_requester", (q) => q.eq("requesterId", viewerId))
        .collect();
      const incoming = await ctx.db
        .query("friendships")
        .withIndex("by_addressee", (q) => q.eq("addresseeId", viewerId))
        .collect();
      for (const f of outgoing) if (f.status === "accepted") friendIds.add(f.addresseeId);
      for (const f of incoming) if (f.status === "accepted") friendIds.add(f.requesterId);
    }

    // Friends first, then everyone else, capped at `limit`.
    going.sort((a, b) => {
      const af = friendIds.has(a.userId) ? 0 : 1;
      const bf = friendIds.has(b.userId) ? 0 : 1;
      return af - bf;
    });

    const friendsGoingCount = going.reduce(
      (n, r) => n + (friendIds.has(r.userId) ? 1 : 0),
      0,
    );

    const sliced = going.slice(0, limit);
    const users = await Promise.all(
      sliced.map(async (r) => {
        const u = await ctx.db.get(r.userId);
        if (!u) return null;
        return {
          _id: u._id,
          name: u.name,
          image: u.image,
          isFriend: friendIds.has(r.userId),
        };
      })
    );
    return {
      attendees: users.filter((u): u is NonNullable<typeof u> => u !== null),
      friendsGoingCount,
    };
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

// Dev-only seed. Inserts a handful of published events so the home Events row
// renders. Skips inserts whose slug already exists, so it's safe to re-run.
//   npx convex run events:devSeed
export const devSeed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const host = await ctx.db.query("users").first();
    if (!host) throw new Error("Need at least one user to host seeded events");

    const day = 86_400_000;
    const now = Date.now();

    const samples = [
      {
        slug: "london-jazz-rooftop",
        name: "Rooftop Jazz Sessions — London",
        description: "Live jazz quartet on the Shoreditch rooftop. BYO bring a friend.",
        locationName: "Shoreditch, London",
        locationCoords: { lat: 51.5256, lng: -0.0784 },
        timezone: "Europe/London",
        startOffsetDays: 5,
        durationHours: 4,
        category: "music",
        imageUrl: "https://picsum.photos/seed/event-jazz/800/600",
      },
      {
        slug: "leeds-street-food-festival",
        name: "Leeds Street Food Festival",
        description: "30+ vendors across Briggate. Family-friendly all day.",
        locationName: "Briggate, Leeds",
        locationCoords: { lat: 53.7997, lng: -1.5436 },
        timezone: "Europe/London",
        startOffsetDays: 9,
        durationHours: 8,
        category: "food",
        imageUrl: "https://picsum.photos/seed/event-streetfood/800/600",
      },
      {
        slug: "lisbon-sunset-fado",
        name: "Sunset Fado at Miradouro",
        description: "Intimate Fado performance with port wine tasting at sunset.",
        locationName: "Miradouro de Santa Catarina, Lisbon",
        locationCoords: { lat: 38.7099, lng: -9.1462 },
        timezone: "Europe/Lisbon",
        startOffsetDays: 14,
        durationHours: 3,
        category: "culture",
        imageUrl: "https://picsum.photos/seed/event-fado/800/600",
      },
      {
        slug: "barcelona-tapas-crawl",
        name: "El Born Tapas Crawl",
        description: "5 stops, 10 plates, 1 unforgettable evening through the Gothic Quarter.",
        locationName: "El Born, Barcelona",
        locationCoords: { lat: 41.3851, lng: 2.1828 },
        timezone: "Europe/Madrid",
        startOffsetDays: 20,
        durationHours: 4,
        category: "food",
        imageUrl: "https://picsum.photos/seed/event-tapas/800/600",
      },
      {
        slug: "amsterdam-canal-cinema",
        name: "Canal-side Open Air Cinema",
        description: "Pop-up screening on Prinsengracht — bring a blanket.",
        locationName: "Prinsengracht, Amsterdam",
        locationCoords: { lat: 52.3676, lng: 4.8852 },
        timezone: "Europe/Amsterdam",
        startOffsetDays: 27,
        durationHours: 3,
        category: "film",
        imageUrl: "https://picsum.photos/seed/event-cinema/800/600",
      },
      {
        slug: "marrakech-rooftop-night",
        name: "Marrakech Rooftop Night Market",
        description: "Mint tea, live oud, lanterns — overlooking the medina.",
        locationName: "Medina, Marrakech",
        locationCoords: { lat: 31.6295, lng: -7.9811 },
        timezone: "Africa/Casablanca",
        startOffsetDays: 33,
        durationHours: 5,
        category: "culture",
        imageUrl: "https://picsum.photos/seed/event-marrakech/800/600",
      },
    ];

    let inserted = 0;
    for (const s of samples) {
      const existing = await ctx.db
        .query("events")
        .withIndex("by_slug", (q) => q.eq("slug", s.slug))
        .unique();
      if (existing) continue;

      const startDateUtc = now + s.startOffsetDays * day;
      await ctx.db.insert("events", {
        name: s.name,
        description: s.description,
        hostUserId: host._id,
        locationName: s.locationName,
        locationCoords: s.locationCoords,
        timezone: s.timezone,
        startDateUtc,
        endDateUtc: startDateUtc + s.durationHours * 60 * 60 * 1000,
        category: s.category,
        imageUrl: s.imageUrl,
        imageUrls: [s.imageUrl],
        slug: s.slug,
        status: "published",
        ticketingMode: "free",
        commissionSplitPct: 0,
        currentParticipants: 0,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      });
      inserted += 1;
    }

    return { inserted, total: samples.length };
  },
});
