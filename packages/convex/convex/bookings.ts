import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  internalMutation,
  mutation,
  query,
} from "./_generated/server";

const BOOKING_TYPE = v.union(
  v.literal("flight"),
  v.literal("hotel"),
  v.literal("tour"),
  v.literal("car_rental"),
  v.literal("event_ticket")
);

export const getMyBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const membership = await ctx.db
      .query("trip_members")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    if (!membership) return [];

    return await ctx.db
      .query("bookings")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();
  },
});

export const createPending = mutation({
  args: {
    type: BOOKING_TYPE,
    apiSource: v.string(),
    apiRef: v.string(),
    grossAmount: v.number(),
    currency: v.string(),
    commissionAmount: v.number(),
    tripId: v.optional(v.id("trips")),
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    return await ctx.db.insert("bookings", {
      userId,
      tripId: args.tripId,
      eventId: args.eventId,
      type: args.type,
      apiSource: args.apiSource,
      apiRef: args.apiRef,
      grossAmount: args.grossAmount,
      currency: args.currency,
      commissionAmount: args.commissionAmount,
      status: "pending",
      bookedAt: Date.now(),
    });
  },
});

// Called from Stripe webhook route handler via internal API.
export const markConfirmed = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    stripePaymentIntentId: v.string(),
    rawResponse: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    await ctx.db.patch(args.bookingId, {
      status: "confirmed",
      stripePaymentIntentId: args.stripePaymentIntentId,
      rawResponse: args.rawResponse,
    });

    await ctx.db.insert("notifications", {
      userId: booking.userId,
      type: "booking_confirmed",
      data: { bookingId: booking._id },
      isRead: false,
      createdAt: Date.now(),
    });
  },
});
