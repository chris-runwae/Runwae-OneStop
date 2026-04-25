import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { pickDefaultCover } from "./lib/coverImage";

const SLUG_SUFFIX_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomId(alphabet: string, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "trip"}-${randomId(SLUG_SUFFIX_ALPHABET, 8)}`;
}

const TRIP_VISIBILITY = v.union(
  v.literal("private"),
  v.literal("invite_only"),
  v.literal("friends"),
  v.literal("public")
);

const TRIP_CATEGORY = v.union(
  v.literal("leisure"),
  v.literal("business"),
  v.literal("family"),
  v.literal("adventure"),
  v.literal("cultural"),
  v.literal("romantic")
);

async function assertTripAccess(
  ctx: { db: any; auth: any },
  tripId: Id<"trips">
): Promise<{ userId: Id<"users">; trip: Doc<"trips">; role: "owner" | "editor" | "viewer" | null }> {
  const userId = await getAuthUserId(ctx as any);
  if (userId === null) throw new Error("Not authenticated");

  const trip = await ctx.db.get(tripId);
  if (!trip) throw new Error("Trip not found");

  const membership = await ctx.db
    .query("trip_members")
    .withIndex("by_trip", (q: any) => q.eq("tripId", tripId))
    .filter((q: any) => q.eq(q.field("userId"), userId))
    .first();

  if (trip.visibility === "public") {
    return { userId, trip, role: membership?.role ?? null };
  }
  if (!membership) throw new Error("Not a member of this trip");
  return { userId, trip, role: membership.role };
}

export const createTrip = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    destinationId: v.optional(v.id("destinations")),
    destinationLabel: v.optional(v.string()),
    destinationCoords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    startDate: v.string(),
    endDate: v.string(),
    category: v.optional(TRIP_CATEGORY),
    visibility: TRIP_VISIBILITY,
    currency: v.string(),
    estimatedBudget: v.optional(v.number()),
    coverImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const startMs = Date.parse(args.startDate);
    const endMs = Date.parse(args.endDate);
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD.");
    }
    if (endMs < startMs) {
      throw new Error("End date cannot be before start date.");
    }

    const now = Date.now();
    const slug = slugify(args.title);
    const joinCode = randomId(JOIN_CODE_ALPHABET, 8);
    const finalCover = args.coverImageUrl ?? pickDefaultCover(slug);

    const tripId = await ctx.db.insert("trips", {
      title: args.title,
      description: args.description,
      destinationId: args.destinationId,
      destinationLabel: args.destinationLabel,
      destinationCoords: args.destinationCoords,
      creatorId: userId,
      startDate: args.startDate,
      endDate: args.endDate,
      category: args.category,
      visibility: args.visibility,
      status: "planning",
      coverImageUrl: finalCover,
      slug,
      joinCode,
      estimatedBudget: args.estimatedBudget,
      currency: args.currency,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("trip_members", {
      tripId,
      userId,
      role: "owner",
      status: "accepted",
      joinedAt: now,
    });

    return { tripId, slug };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const trip = await ctx.db
      .query("trips")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!trip) return null;

    if (trip.visibility === "public") return trip;

    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const membership = await ctx.db
      .query("trip_members")
      .withIndex("by_trip", (q) => q.eq("tripId", trip._id))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return membership ? trip : null;
  },
});

export const getMyTrips = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const memberships = await ctx.db
      .query("trip_members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const trips = await Promise.all(
      memberships.map((m) => ctx.db.get(m.tripId))
    );
    return trips.filter((t): t is Doc<"trips"> => t !== null);
  },
});

export const updateTrip = mutation({
  args: {
    tripId: v.id("trips"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    destinationId: v.optional(v.id("destinations")),
    destinationLabel: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    category: v.optional(TRIP_CATEGORY),
    visibility: v.optional(TRIP_VISIBILITY),
    status: v.optional(
      v.union(
        v.literal("planning"),
        v.literal("upcoming"),
        v.literal("ongoing"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    coverImageUrl: v.optional(v.string()),
    estimatedBudget: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { role } = await assertTripAccess(ctx, args.tripId);
    if (role !== "owner" && role !== "editor") {
      throw new Error("Not authorized to edit this trip");
    }

    const { tripId, ...patch } = args;
    const update: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(patch)) {
      if (val !== undefined) update[k] = val;
    }
    await ctx.db.patch(tripId, update);
    return await ctx.db.get(tripId);
  },
});

export const joinByCode = mutation({
  args: { joinCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const trip = await ctx.db
      .query("trips")
      .withIndex("by_join_code", (q) => q.eq("joinCode", args.joinCode))
      .unique();
    if (!trip) throw new Error("Invalid join code");

    const existing = await ctx.db
      .query("trip_members")
      .withIndex("by_trip", (q) => q.eq("tripId", trip._id))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) return trip._id;

    await ctx.db.insert("trip_members", {
      tripId: trip._id,
      userId,
      role: "viewer",
      status: "accepted",
      joinedAt: Date.now(),
    });

    return trip._id;
  },
});

export const cloneTrip = mutation({
  args: {
    tripId: v.id("trips"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const source = await ctx.db.get(args.tripId);
    if (!source) throw new Error("Trip not found");

    // Must be public OR the cloner must be a member.
    if (source.visibility !== "public") {
      const member = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("tripId", source._id))
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();
      if (!member) throw new Error("Not authorized to clone this trip");
    }

    const now = Date.now();
    const newTitle = args.title ?? `${source.title} (copy)`;
    const newTripId = await ctx.db.insert("trips", {
      title: newTitle,
      description: source.description,
      destinationId: source.destinationId,
      destinationLabel: source.destinationLabel,
      destinationCoords: source.destinationCoords,
      creatorId: userId,
      startDate: source.startDate,
      endDate: source.endDate,
      category: source.category,
      visibility: "private",
      status: "planning",
      coverImageUrl: source.coverImageUrl,
      slug: slugify(newTitle),
      joinCode: randomId(JOIN_CODE_ALPHABET, 8),
      estimatedBudget: source.estimatedBudget,
      currency: source.currency,
      clonedFromId: source._id,
      sourceTemplateId: source.sourceTemplateId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("trip_members", {
      tripId: newTripId,
      userId,
      role: "owner",
      status: "accepted",
      joinedAt: now,
    });

    const days = await ctx.db
      .query("itinerary_days")
      .withIndex("by_trip", (q) => q.eq("tripId", source._id))
      .collect();

    const dayIdMap = new Map<Id<"itinerary_days">, Id<"itinerary_days">>();
    for (const day of days) {
      const newDayId = await ctx.db.insert("itinerary_days", {
        tripId: newTripId,
        date: day.date,
        dayNumber: day.dayNumber,
        title: day.title,
        notes: day.notes,
        createdAt: now,
      });
      dayIdMap.set(day._id, newDayId);
    }

    const items = await ctx.db
      .query("itinerary_items")
      .withIndex("by_trip", (q) => q.eq("tripId", source._id))
      .collect();

    for (const item of items) {
      const newDayId = dayIdMap.get(item.dayId);
      if (!newDayId) continue;
      await ctx.db.insert("itinerary_items", {
        tripId: newTripId,
        dayId: newDayId,
        addedByUserId: userId,
        type: item.type,
        apiSource: item.apiSource,
        apiRef: item.apiRef,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        currency: item.currency,
        startTime: item.startTime,
        endTime: item.endTime,
        locationName: item.locationName,
        coords: item.coords,
        bookingReference: undefined,
        notes: item.notes,
        isCompleted: false,
        sortOrder: item.sortOrder,
        canBeEditedBy: item.canBeEditedBy,
        createdAt: now,
        updatedAt: now,
      });
    }

    const saved = await ctx.db
      .query("saved_items")
      .withIndex("by_trip", (q) => q.eq("tripId", source._id))
      .collect();

    for (const s of saved) {
      await ctx.db.insert("saved_items", {
        tripId: newTripId,
        addedByUserId: userId,
        type: s.type,
        apiSource: s.apiSource,
        apiRef: s.apiRef,
        title: s.title,
        description: s.description,
        imageUrl: s.imageUrl,
        price: s.price,
        currency: s.currency,
        date: s.date,
        endDate: s.endDate,
        locationName: s.locationName,
        coords: s.coords,
        externalUrl: s.externalUrl,
        notes: s.notes,
        isManual: s.isManual,
        addedToItinerary: false,
        createdAt: now,
      });
    }

    return newTripId;
  },
});
