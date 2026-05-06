import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import { requireHost } from "../lib/host";
import type { Doc } from "../_generated/dataModel";

const STATUS = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("cancelled"),
  v.literal("completed")
);

// Bookings tied to events the calling host owns. We index by_event for each
// of the host's events and merge — the events table is the only foreign-key
// path from a host to a booking (commissions.hostId is set on payment, but
// this query needs to surface unpaid bookings too).
export const listMyBookings = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(STATUS),
  },
  handler: async (ctx, args) => {
    const host = await requireHost(ctx);

    const events = await ctx.db
      .query("events")
      .withIndex("by_host", (q) => q.eq("hostUserId", host._id))
      .collect();
    if (events.length === 0) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    // Convex doesn't let us paginate across multiple by_event index lookups,
    // so fan out, concat, sort, and slice. Bounded by event count × per-event
    // booking count — fine for any single host.
    const allBookings: Doc<"bookings">[] = [];
    for (const event of events) {
      const rows = await ctx.db
        .query("bookings")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      allBookings.push(...rows);
    }
    allBookings.sort((a, b) => b.bookedAt - a.bookedAt);

    const filtered = args.status
      ? allBookings.filter((b) => b.status === args.status)
      : allBookings;

    const cursor = args.paginationOpts.cursor;
    const offset = cursor ? Number.parseInt(cursor, 10) : 0;
    const take = args.paginationOpts.numItems;
    const slice = filtered.slice(offset, offset + take);

    const userIds = Array.from(new Set(slice.map((b) => b.userId)));
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    const userById = new Map(
      users
        .filter((u): u is Doc<"users"> => Boolean(u))
        .map((u) => [u._id, u])
    );
    const eventById = new Map(events.map((e) => [e._id, e]));

    return {
      page: slice.map((b) => ({
        ...b,
        user: userById.get(b.userId)
          ? {
              _id: b.userId,
              name: userById.get(b.userId)!.name ?? null,
              email: userById.get(b.userId)!.email ?? null,
            }
          : null,
        event:
          b.eventId && eventById.get(b.eventId)
            ? {
                _id: b.eventId,
                name: eventById.get(b.eventId)!.name,
                slug: eventById.get(b.eventId)!.slug,
              }
            : null,
      })),
      isDone: offset + take >= filtered.length,
      continueCursor: String(offset + take),
    };
  },
});
