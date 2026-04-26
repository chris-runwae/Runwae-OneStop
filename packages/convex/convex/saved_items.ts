import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const SAVED_ITEM_TYPE = v.union(
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

async function assertTripMember(
  ctx: any,
  tripId: Id<"trips">,
  userId: Id<"users">
) {
  const membership = await ctx.db
    .query("trip_members")
    .withIndex("by_trip", (q: any) => q.eq("tripId", tripId))
    .filter((q: any) => q.eq(q.field("userId"), userId))
    .first();
  if (!membership) throw new Error("Not a member of this trip");
  return membership;
}

export const addSavedItem = mutation({
  args: {
    tripId: v.id("trips"),
    type: SAVED_ITEM_TYPE,
    apiSource: v.optional(v.string()),
    apiRef: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    date: v.optional(v.string()),
    endDate: v.optional(v.string()),
    locationName: v.optional(v.string()),
    coords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    externalUrl: v.optional(v.string()),
    isManual: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    await assertTripMember(ctx, args.tripId, userId);

    return await ctx.db.insert("saved_items", {
      tripId: args.tripId,
      addedByUserId: userId,
      type: args.type,
      apiSource: args.apiSource,
      apiRef: args.apiRef,
      title: args.title,
      description: args.description,
      imageUrl: args.imageUrl,
      price: args.price,
      currency: args.currency,
      date: args.date,
      endDate: args.endDate,
      locationName: args.locationName,
      coords: args.coords,
      externalUrl: args.externalUrl,
      notes: args.notes,
      isManual: args.isManual,
      addedToItinerary: false,
      createdAt: Date.now(),
    });
  },
});

export const getSavedItems = query({
  args: {
    tripId: v.id("trips"),
    type: v.optional(SAVED_ITEM_TYPE),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const trip = await ctx.db.get(args.tripId);
    if (!trip) return [];
    if (trip.visibility !== "public") {
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();
      if (!membership) return [];
    }

    if (args.type !== undefined) {
      const type = args.type;
      return await ctx.db
        .query("saved_items")
        .withIndex("by_trip_type", (q) =>
          q.eq("tripId", args.tripId).eq("type", type)
        )
        .collect();
    }
    return await ctx.db
      .query("saved_items")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();
  },
});

export const removeSavedItem = mutation({
  args: { savedItemId: v.id("saved_items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.savedItemId);
    if (!item) throw new Error("Saved item not found");
    await assertTripMember(ctx, item.tripId, userId);

    await ctx.db.delete(args.savedItemId);
    return { ok: true };
  },
});

export const addComment = mutation({
  args: { savedItemId: v.id("saved_items"), content: v.string() },
  handler: async (ctx, { savedItemId, content }) => {
    const text = content.trim();
    if (text.length === 0) throw new Error("Comment cannot be empty.");
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const saved = await ctx.db.get(savedItemId);
    if (!saved) throw new Error("Saved item not found.");
    await assertTripMember(ctx, saved.tripId, userId);
    const now = Date.now();
    return await ctx.db.insert("saved_item_comments", {
      tripId: saved.tripId,
      savedItemId,
      userId,
      content: text,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getComments = query({
  args: { savedItemId: v.id("saved_items") },
  handler: async (ctx, { savedItemId }) => {
    const saved = await ctx.db.get(savedItemId);
    if (!saved) return [];
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const trip = await ctx.db.get(saved.tripId);
    if (!trip) return [];
    if (trip.visibility !== "public") {
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("tripId", saved.tripId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();
      if (!membership) return [];
    }
    const rows = await ctx.db
      .query("saved_item_comments")
      .withIndex("by_saved_item", (q) => q.eq("savedItemId", savedItemId))
      .order("asc")
      .collect();
    return Promise.all(rows.map(async (r) => ({
      ...r,
      author: await ctx.db.get(r.userId),
    })));
  },
});

export const getCommentCounts = query({
  args: { savedItemIds: v.array(v.id("saved_items")) },
  handler: async (ctx, { savedItemIds }) => {
    const counts: Record<string, number> = {};
    for (const id of savedItemIds) {
      const rows = await ctx.db
        .query("saved_item_comments")
        .withIndex("by_saved_item", (q) => q.eq("savedItemId", id))
        .collect();
      counts[id] = rows.length;
    }
    return counts as Record<Id<"saved_items">, number>;
  },
});

export const removeComment = mutation({
  args: { commentId: v.id("saved_item_comments") },
  handler: async (ctx, { commentId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const comment = await ctx.db.get(commentId);
    if (!comment) return;
    await assertTripMember(ctx, comment.tripId, userId);
    if (comment.userId !== userId) throw new Error("Not your comment.");
    await ctx.db.delete(commentId);
  },
});

export const promoteToItinerary = mutation({
  args: {
    savedItemId: v.id("saved_items"),
    dayId: v.id("itinerary_days"),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const saved = await ctx.db.get(args.savedItemId);
    if (!saved) throw new Error("Saved item not found");
    await assertTripMember(ctx, saved.tripId, userId);

    const day = await ctx.db.get(args.dayId);
    if (!day) throw new Error("Itinerary day not found");
    if (day.tripId !== saved.tripId) {
      throw new Error("Day does not belong to the saved item's trip");
    }

    const siblings = await ctx.db
      .query("itinerary_items")
      .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
      .collect();
    const nextOrder = siblings.length;

    const now = Date.now();
    const itemId = await ctx.db.insert("itinerary_items", {
      tripId: saved.tripId,
      dayId: args.dayId,
      addedByUserId: userId,
      savedItemId: saved._id,
      type: saved.type,
      apiSource: saved.apiSource,
      apiRef: saved.apiRef,
      title: saved.title,
      description: saved.description,
      imageUrl: saved.imageUrl,
      price: saved.price,
      currency: saved.currency,
      startTime: args.startTime,
      endTime: args.endTime,
      locationName: saved.locationName,
      coords: saved.coords,
      notes: saved.notes,
      isCompleted: false,
      sortOrder: nextOrder,
      canBeEditedBy: "editors",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(saved._id, {
      addedToItinerary: true,
      itineraryItemId: itemId,
    });

    return itemId;
  },
});
