import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const ITEM_TYPE = v.union(
  v.literal("flight"),
  v.literal("hotel"),
  v.literal("tour"),
  v.literal("car_rental"),
  v.literal("event"),
  v.literal("restaurant"),
  v.literal("activity"),
  v.literal("transport"),
  v.literal("other")
);

const EDIT_SCOPE = v.union(
  v.literal("creator_only"),
  v.literal("editors"),
  v.literal("all_members")
);

async function assertTripAccess(
  ctx: any,
  tripId: Id<"trips">,
  mode: "read" | "write"
) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Not authenticated");

  const trip = await ctx.db.get(tripId);
  if (!trip) throw new Error("Trip not found");

  const membership = await ctx.db
    .query("trip_members")
    .withIndex("by_trip", (q: any) => q.eq("tripId", tripId))
    .filter((q: any) => q.eq(q.field("userId"), userId))
    .first();

  if (mode === "read" && trip.visibility === "public") {
    return { userId, membership };
  }
  if (!membership) throw new Error("Not a member of this trip");
  if (mode === "write" && membership.role === "viewer") {
    throw new Error("Viewers cannot modify itinerary");
  }
  return { userId, membership };
}

export const getItinerary = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return null;

    if (trip.visibility !== "public") {
      if (userId === null) return null;
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();
      if (!membership) return null;
    }

    const days = await ctx.db
      .query("itinerary_days")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();
    days.sort((a, b) => a.dayNumber - b.dayNumber);

    const items = await ctx.db
      .query("itinerary_items")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();
    items.sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      days: days.map((day) => ({
        ...day,
        items: items.filter((i) => i.dayId === day._id),
      })),
    };
  },
});

export const addDay = mutation({
  args: {
    tripId: v.id("trips"),
    date: v.string(),
    dayNumber: v.number(),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertTripAccess(ctx, args.tripId, "write");
    return await ctx.db.insert("itinerary_days", {
      tripId: args.tripId,
      date: args.date,
      dayNumber: args.dayNumber,
      title: args.title,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

// Appends a day to the end of a trip's itinerary. The frontend shouldn't
// need to know about dayNumber/date — we compute them by extending from the
// last existing day, falling back to the trip's startDate for a fresh trip.
export const appendDay = mutation({
  args: {
    tripId: v.id("trips"),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertTripAccess(ctx, args.tripId, "write");
    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");

    const days = await ctx.db
      .query("itinerary_days")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();
    days.sort((a, b) => a.dayNumber - b.dayNumber);
    const last = days[days.length - 1];

    const dayNumber = last ? last.dayNumber + 1 : 1;
    const baseMs = last
      ? Date.parse(last.date) + 24 * 60 * 60 * 1000
      : Date.parse(trip.startDate);
    const safeBase = Number.isFinite(baseMs) ? baseMs : Date.now();
    const date = new Date(safeBase).toISOString().slice(0, 10);

    return await ctx.db.insert("itinerary_days", {
      tripId: args.tripId,
      date,
      dayNumber,
      title: args.title,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const addItem = mutation({
  args: {
    tripId: v.id("trips"),
    dayId: v.id("itinerary_days"),
    type: ITEM_TYPE,
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    locationName: v.optional(v.string()),
    coords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    bookingReference: v.optional(v.string()),
    notes: v.optional(v.string()),
    apiSource: v.optional(v.string()),
    apiRef: v.optional(v.string()),
    canBeEditedBy: v.optional(EDIT_SCOPE),
  },
  handler: async (ctx, args) => {
    const { userId } = await assertTripAccess(ctx, args.tripId, "write");
    const day = await ctx.db.get(args.dayId);
    if (!day || day.tripId !== args.tripId) {
      throw new Error("Day does not belong to this trip");
    }

    const siblings = await ctx.db
      .query("itinerary_items")
      .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
      .collect();
    const sortOrder = siblings.length;

    const now = Date.now();
    return await ctx.db.insert("itinerary_items", {
      tripId: args.tripId,
      dayId: args.dayId,
      addedByUserId: userId,
      type: args.type,
      apiSource: args.apiSource,
      apiRef: args.apiRef,
      title: args.title,
      description: args.description,
      imageUrl: args.imageUrl,
      price: args.price,
      currency: args.currency,
      startTime: args.startTime,
      endTime: args.endTime,
      locationName: args.locationName,
      coords: args.coords,
      bookingReference: args.bookingReference,
      notes: args.notes,
      isCompleted: false,
      sortOrder,
      canBeEditedBy: args.canBeEditedBy ?? "editors",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateItem = mutation({
  args: {
    itemId: v.id("itinerary_items"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    locationName: v.optional(v.string()),
    coords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    bookingReference: v.optional(v.string()),
    notes: v.optional(v.string()),
    isCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    await assertTripAccess(ctx, item.tripId, "write");

    const { itemId, ...rest } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(rest)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(itemId, patch);
    return await ctx.db.get(itemId);
  },
});

export const deleteItem = mutation({
  args: { itemId: v.id("itinerary_items") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) return { ok: true };
    await assertTripAccess(ctx, item.tripId, "write");

    if (item.savedItemId) {
      const saved = await ctx.db.get(item.savedItemId);
      if (saved) {
        await ctx.db.patch(item.savedItemId, {
          addedToItinerary: false,
          itineraryItemId: undefined,
        });
      }
    }

    await ctx.db.delete(args.itemId);
    return { ok: true };
  },
});

export const reorderItem = mutation({
  args: {
    itemId: v.id("itinerary_items"),
    sortOrder: v.number(),
    dayId: v.optional(v.id("itinerary_days")),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    await assertTripAccess(ctx, item.tripId, "write");

    const patch: Record<string, unknown> = {
      sortOrder: args.sortOrder,
      updatedAt: Date.now(),
    };
    if (args.dayId !== undefined && args.dayId !== item.dayId) {
      const newDay = await ctx.db.get(args.dayId);
      if (!newDay || newDay.tripId !== item.tripId) {
        throw new Error("Day does not belong to this trip");
      }
      patch.dayId = args.dayId;
    }
    await ctx.db.patch(args.itemId, patch);
    return await ctx.db.get(args.itemId);
  },
});

// Mock travel times between consecutive items in a day.
// Will be replaced by Google Maps Distance Matrix.
export const getDayWithTravelTimes = query({
  args: { dayId: v.id("itinerary_days") },
  handler: async (ctx, args) => {
    const day = await ctx.db.get(args.dayId);
    if (!day) return null;

    const userId = await getAuthUserId(ctx);
    const trip = await ctx.db.get(day.tripId);
    if (!trip) return null;
    if (trip.visibility !== "public") {
      if (userId === null) return null;
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("tripId", day.tripId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();
      if (!membership) return null;
    }

    const items = await ctx.db
      .query("itinerary_items")
      .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
      .collect();
    items.sort((a, b) => a.sortOrder - b.sortOrder);

    const legs = items.slice(0, -1).map((from, i) => ({
      fromItemId: from._id,
      toItemId: items[i + 1]._id,
      distanceKm: Math.round((2 + i * 1.5) * 10) / 10,
      durationMin: 10 + i * 5,
    }));

    return { day, items, legs };
  },
});
