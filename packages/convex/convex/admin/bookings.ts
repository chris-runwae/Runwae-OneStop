import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import { requireAdmin } from "../lib/admin";
import type { Doc } from "../_generated/dataModel";

const STATUS = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("cancelled"),
  v.literal("completed")
);

const TYPE = v.union(
  v.literal("flight"),
  v.literal("hotel"),
  v.literal("tour"),
  v.literal("car_rental"),
  v.literal("event_ticket")
);

export const listAll = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(STATUS),
    type: v.optional(TYPE),
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const baseQuery = args.eventId
      ? ctx.db
          .query("bookings")
          .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
          .order("desc")
      : ctx.db.query("bookings").order("desc");

    const result = await baseQuery.paginate(args.paginationOpts);

    let page = result.page;
    if (args.status) page = page.filter((b) => b.status === args.status);
    if (args.type) page = page.filter((b) => b.type === args.type);

    const userIds = Array.from(new Set(page.map((b) => b.userId)));
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    const userById = new Map(
      users
        .filter((u): u is Doc<"users"> => Boolean(u))
        .map((u) => [u._id, u])
    );

    const eventIds = Array.from(
      new Set(
        page
          .map((b) => b.eventId)
          .filter((id): id is NonNullable<typeof id> => Boolean(id))
      )
    );
    const events = await Promise.all(eventIds.map((id) => ctx.db.get(id)));
    const eventById = new Map(
      events
        .filter((e): e is Doc<"events"> => Boolean(e))
        .map((e) => [e._id, e])
    );

    return {
      ...result,
      page: page.map((b) => ({
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
    };
  },
});
