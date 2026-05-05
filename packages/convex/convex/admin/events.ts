import { v, ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/admin";
import { sendEventStatusEmail } from "../lib/email";
import type { Doc } from "../_generated/dataModel";

const STATUS = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("cancelled"),
  v.literal("completed")
);

type EventStatus = Doc<"events">["status"];

// Allowed forward transitions. cancelled and completed are terminal —
// reverting requires a DB intervention rather than admin UI to keep the
// audit trail meaningful. Self-transitions (no-op) are permitted so the
// admin can re-confirm a status without the UI throwing.
const ALLOWED_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ["draft", "published", "cancelled"],
  published: ["published", "cancelled", "completed"],
  cancelled: ["cancelled"],
  completed: ["completed"],
};

export const listAll = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(STATUS),
    trendingOnly: v.optional(v.boolean()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const baseQuery = args.trendingOnly
      ? ctx.db
          .query("events")
          .withIndex("by_trending", (q) => q.eq("isTrending", true))
          .order("desc")
      : ctx.db.query("events").order("desc");

    const result = await baseQuery.paginate(args.paginationOpts);

    let page = result.page;
    if (args.status) {
      page = page.filter((e) => e.status === args.status);
    }
    if (args.search && args.search.trim()) {
      const needle = args.search.trim().toLowerCase();
      page = page.filter(
        (e) =>
          e.name.toLowerCase().includes(needle) ||
          e.locationName.toLowerCase().includes(needle)
      );
    }

    // Hydrate host name so the table can render "by <host>" without a
    // separate query per row in the client.
    const hostIds = Array.from(new Set(page.map((e) => e.hostUserId)));
    const hosts = await Promise.all(hostIds.map((id) => ctx.db.get(id)));
    const hostById = new Map(
      hosts
        .filter((h): h is Doc<"users"> => Boolean(h))
        .map((h) => [h._id, h])
    );

    return {
      ...result,
      page: page.map((e) => ({
        ...e,
        host: hostById.get(e.hostUserId)
          ? {
              _id: e.hostUserId,
              name: hostById.get(e.hostUserId)!.name ?? null,
              email: hostById.get(e.hostUserId)!.email ?? null,
            }
          : null,
      })),
    };
  },
});

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) return null;
    const host = await ctx.db.get(row.hostUserId);
    const destination = row.destinationId
      ? await ctx.db.get(row.destinationId)
      : null;
    return {
      ...row,
      host: host
        ? {
            _id: host._id,
            name: host.name ?? null,
            email: host.email ?? null,
          }
        : null,
      destination: destination
        ? { _id: destination._id, name: destination.name }
        : null,
    };
  },
});

export const setTrending = mutation({
  args: {
    eventId: v.id("events"),
    isTrending: v.boolean(),
    trendingRank: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.eventId);
    if (!row) throw new ConvexError("Event not found");

    let rank: number | undefined = args.trendingRank;
    if (args.isTrending && rank === undefined) {
      // Auto-assign max(rank)+1 across currently-trending events so the
      // newly-trending event lands at the end of the rail by default.
      const trending = await ctx.db
        .query("events")
        .withIndex("by_trending", (q) => q.eq("isTrending", true))
        .collect();
      const others = trending.filter((e) => e._id !== args.eventId);
      const max = others.reduce(
        (m: number, e) => Math.max(m, e.trendingRank ?? 0),
        0
      );
      rank = max + 1;
    }
    if (!args.isTrending) rank = undefined;

    await ctx.db.patch(args.eventId, {
      isTrending: args.isTrending,
      trendingRank: rank,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.eventId);
  },
});

export const setStatus = mutation({
  args: {
    eventId: v.id("events"),
    status: STATUS,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.eventId);
    if (!row) throw new ConvexError("Event not found");

    const allowed = ALLOWED_TRANSITIONS[row.status];
    if (!allowed.includes(args.status)) {
      throw new ConvexError(
        `Cannot change status from "${row.status}" to "${args.status}". ` +
          `Allowed transitions: ${allowed.join(", ")}.`
      );
    }

    if (row.status === args.status) return row;

    await ctx.db.patch(args.eventId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Notify host on transitions that affect them. Stubbed when Resend
    // isn't configured — see lib/email.ts.
    if (args.status === "cancelled" || args.status === "completed") {
      const host = await ctx.db.get(row.hostUserId);
      await sendEventStatusEmail({
        kind: args.status === "cancelled" ? "event_cancelled" : "event_completed",
        to: host?.email ?? null,
        hostName: host?.name ?? null,
        eventName: row.name,
        eventSlug: row.slug,
      });
    }

    return await ctx.db.get(args.eventId);
  },
});

export const updateAdminNotes = mutation({
  args: {
    eventId: v.id("events"),
    adminNotes: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.eventId);
    if (!row) throw new ConvexError("Event not found");

    // Empty string → undefined, mirroring the destination-form pattern so
    // we don't carry empty strings around in the DB.
    const next = args.adminNotes.trim() ? args.adminNotes : undefined;
    await ctx.db.patch(args.eventId, {
      adminNotes: next,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.eventId);
  },
});
