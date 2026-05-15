import { v, ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "../_generated/server";
import { requireHost } from "../lib/host";
import { kebabize, randomSlugSuffix } from "../lib/slug";
import { toPublicEvent } from "../lib/event_sanitize";

const STATUS = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("cancelled"),
  v.literal("completed")
);

const TICKETING = v.union(
  v.literal("runwae"),
  v.literal("external"),
  v.literal("free"),
  v.literal("none")
);

const HOST_ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ["draft", "published", "cancelled"],
  // Hosts can pull a published event back to draft to edit; admins keep
  // the stricter forward-only state machine in admin/events.ts::setStatus.
  published: ["published", "draft", "cancelled"],
  cancelled: ["cancelled"],
  completed: ["completed"],
};

// Lightweight list for selector UIs (e.g. chart dropdowns). Returns just
// {_id, name, status, startDateUtc} for every event the host owns.
export const listAllForHost = query({
  args: {},
  handler: async (ctx) => {
    const host = await requireHost(ctx);
    const rows = await ctx.db
      .query("events")
      .withIndex("by_host", (q) => q.eq("hostUserId", host._id))
      .collect();
    return rows
      .sort((a, b) => b.startDateUtc - a.startDateUtc)
      .map((e) => ({
        _id: e._id,
        name: e.name,
        status: e.status,
        startDateUtc: e.startDateUtc,
      }));
  },
});

export const getMyEvents = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(STATUS),
  },
  handler: async (ctx, args) => {
    const host = await requireHost(ctx);
    const result = await ctx.db
      .query("events")
      .withIndex("by_host", (q) => q.eq("hostUserId", host._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = args.status
      ? result.page.filter((e) => e.status === args.status)
      : result.page;
    return { ...result, page: page.map(toPublicEvent) };
  },
});

export const getMyEventById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const host = await requireHost(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) return null;
    if (row.hostUserId !== host._id) throw new ConvexError("Forbidden");
    return toPublicEvent(row);
  },
});

export const createEvent = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    destinationId: v.optional(v.id("destinations")),
    locationName: v.string(),
    locationCoords: v.optional(
      v.object({ lat: v.number(), lng: v.number() })
    ),
    timezone: v.string(),
    startDateUtc: v.number(),
    endDateUtc: v.optional(v.number()),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    ticketingMode: TICKETING,
    externalTicketUrl: v.optional(v.string()),
    commissionSplitPct: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const host = await requireHost(ctx);

    if (!args.name.trim()) throw new ConvexError("Name is required");
    if (!args.timezone.trim()) throw new ConvexError("Timezone is required");
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: args.timezone });
    } catch {
      throw new ConvexError(
        `Unknown timezone "${args.timezone}" — pass an IANA id like "Europe/London".`
      );
    }
    if (args.endDateUtc !== undefined && args.endDateUtc < args.startDateUtc) {
      throw new ConvexError("endDateUtc cannot be before startDateUtc");
    }

    const slug = `${kebabize(args.name) || "event"}-${randomSlugSuffix()}`;
    const now = Date.now();
    const eventId = await ctx.db.insert("events", {
      name: args.name.trim(),
      description: args.description,
      hostUserId: host._id,
      destinationId: args.destinationId,
      locationName: args.locationName.trim(),
      locationCoords: args.locationCoords,
      timezone: args.timezone,
      startDateUtc: args.startDateUtc,
      endDateUtc: args.endDateUtc,
      category: args.category,
      imageUrl: args.imageUrl,
      imageUrls: args.imageUrls ?? [],
      slug,
      status: "draft",
      ticketingMode: args.ticketingMode,
      externalTicketUrl: args.externalTicketUrl,
      // Default host share of Runwae's commission. Admin can override
      // per-event via admin.events.setCommissionSplit for promos /
      // premium hosts; the 50% baseline matches the platform spec.
      commissionSplitPct: args.commissionSplitPct ?? 50,
      currentParticipants: 0,
      viewCount: 0,
      isTrending: false,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(eventId);
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    destinationId: v.optional(v.id("destinations")),
    locationName: v.optional(v.string()),
    locationCoords: v.optional(
      v.object({ lat: v.number(), lng: v.number() })
    ),
    timezone: v.optional(v.string()),
    startDateUtc: v.optional(v.number()),
    endDateUtc: v.optional(v.number()),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    ticketingMode: v.optional(TICKETING),
    externalTicketUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const host = await requireHost(ctx);
    const row = await ctx.db.get(args.eventId);
    if (!row) throw new ConvexError("Event not found");
    if (row.hostUserId !== host._id) throw new ConvexError("Forbidden");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) {
      if (!args.name.trim()) throw new ConvexError("Name cannot be empty");
      patch.name = args.name.trim();
    }
    if (args.description !== undefined) patch.description = args.description;
    if (args.destinationId !== undefined)
      patch.destinationId = args.destinationId;
    if (args.locationName !== undefined)
      patch.locationName = args.locationName.trim();
    if (args.locationCoords !== undefined)
      patch.locationCoords = args.locationCoords;
    if (args.timezone !== undefined) {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: args.timezone });
      } catch {
        throw new ConvexError(`Unknown timezone "${args.timezone}"`);
      }
      patch.timezone = args.timezone;
    }
    if (args.startDateUtc !== undefined) patch.startDateUtc = args.startDateUtc;
    if (args.endDateUtc !== undefined) patch.endDateUtc = args.endDateUtc;
    if (args.category !== undefined) patch.category = args.category;
    if (args.imageUrl !== undefined) patch.imageUrl = args.imageUrl;
    if (args.imageUrls !== undefined) patch.imageUrls = args.imageUrls;
    if (args.ticketingMode !== undefined)
      patch.ticketingMode = args.ticketingMode;
    if (args.externalTicketUrl !== undefined)
      patch.externalTicketUrl = args.externalTicketUrl;

    const nextStart =
      (patch.startDateUtc as number | undefined) ?? row.startDateUtc;
    const nextEnd =
      (patch.endDateUtc as number | undefined) ?? row.endDateUtc;
    if (nextEnd !== undefined && nextEnd < nextStart) {
      throw new ConvexError("endDateUtc cannot be before startDateUtc");
    }

    await ctx.db.patch(args.eventId, patch);
    return await ctx.db.get(args.eventId);
  },
});

export const setStatus = mutation({
  args: { eventId: v.id("events"), status: STATUS },
  handler: async (ctx, args) => {
    const host = await requireHost(ctx);
    const row = await ctx.db.get(args.eventId);
    if (!row) throw new ConvexError("Event not found");
    if (row.hostUserId !== host._id) throw new ConvexError("Forbidden");

    const allowed = HOST_ALLOWED_TRANSITIONS[row.status] ?? [];
    if (!allowed.includes(args.status)) {
      throw new ConvexError(
        `Hosts cannot change status from "${row.status}" to "${args.status}". ` +
          `Allowed: ${allowed.join(", ")}.`
      );
    }
    if (row.status === args.status) return row;
    await ctx.db.patch(args.eventId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.eventId);
  },
});

// Soft-delete equivalent: hosts can only cancel their own events.
// Hard delete remains an admin-only operation (not exposed yet).
export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const host = await requireHost(ctx);
    const row = await ctx.db.get(args.eventId);
    if (!row) throw new ConvexError("Event not found");
    if (row.hostUserId !== host._id) throw new ConvexError("Forbidden");
    if (row.status === "completed") {
      throw new ConvexError("Completed events cannot be cancelled");
    }
    await ctx.db.patch(args.eventId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.eventId);
  },
});
