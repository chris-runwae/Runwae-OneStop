import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { DiscoveryDetail, DiscoveryItem } from "./providers/types";
import type { LiteApiRate } from "./providers/liteapi";

export const search = action({
  args: {
    term: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    checkin: v.optional(v.string()),
    checkout: v.optional(v.string()),
    adults: v.optional(v.number()),
    limit: v.optional(v.number()),
    sortBy: v.optional(
      v.union(v.literal("price_asc"), v.literal("price_desc"), v.literal("rating"))
    ),
  },
  handler: async (ctx, args): Promise<DiscoveryItem[]> => {
    const items: DiscoveryItem[] = await ctx.runAction(
      internal.providers.liteapi.search,
      {
        category: "stay",
        term: args.term ?? "",
        lat: args.lat,
        lng: args.lng,
        limit: args.limit ?? 20,
        checkin: args.checkin,
        checkout: args.checkout,
      },
    );

    const sorted = [...items];
    switch (args.sortBy) {
      case "price_asc":
        sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "price_desc":
        sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
    }
    return sorted;
  },
});

export const getDetail = action({
  args: { apiRef: v.string() },
  handler: async (ctx, args): Promise<DiscoveryDetail | null> => {
    return await ctx.runAction(internal.providers.liteapi.getDetail, {
      apiRef: args.apiRef,
    });
  },
});

export const getRates = action({
  args: {
    apiRef: v.string(),
    checkin: v.string(),
    checkout: v.string(),
    adults: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<LiteApiRate[]> => {
    return await ctx.runAction(internal.providers.liteapi.getRoomRates, args);
  },
});

export const startBooking = action({
  args: {
    apiRef: v.string(),
    rateId: v.string(),
    hotelName: v.string(),
    checkin: v.string(),
    checkout: v.string(),
    eventId: v.optional(v.id("events")),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    bookingId: string;
    finalPrice: number;
    currency: string;
  }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const pre = await ctx.runAction(internal.providers.liteapi.prebook, {
      rateId: args.rateId,
    });
    if (!pre) throw new Error("Could not prebook this rate — try another.");

    // Commission: 10% of hotel revenue.
    const commission = Math.round(pre.finalPrice * 0.1);
    const bookingId: string = await ctx.runMutation(
      internal.bookings.createPendingHotel,
      {
        userId,
        apiSource: "liteapi",
        apiRef: args.apiRef,
        prebookId: pre.prebookId,
        hotelName: args.hotelName,
        checkin: args.checkin,
        checkout: args.checkout,
        grossAmount: pre.finalPrice,
        currency: pre.currency,
        commissionAmount: commission,
        eventId: args.eventId,
      },
    );

    return { bookingId, finalPrice: pre.finalPrice, currency: pre.currency };
  },
});

// Internal — scheduled by bookings.confirmByStripeSession after Stripe payment
// is captured for a hotel booking. Calls LiteAPI book(prebookId), then writes
// the result back via internal mutation.
export const finalisePaidBooking = internalAction({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, { bookingId }): Promise<void> => {
    const booking = await ctx.runQuery(internal.bookings.getInternalBooking, {
      bookingId,
    });
    if (!booking) return;
    const prebookId = booking.rawResponse?.prebookId as string | undefined;
    if (!prebookId) {
      await ctx.runMutation(internal.bookings.finaliseHotelBooking, {
        bookingId,
        success: false,
      });
      return;
    }

    const holder = await ctx.runQuery(internal.bookings.getBookingHolder, {
      userId: booking.userId,
    });
    const result = await ctx.runAction(internal.providers.liteapi.book, {
      prebookId,
      holderFirstName: holder.firstName,
      holderLastName: holder.lastName,
      holderEmail: holder.email,
      paymentRef: booking.stripePaymentIntentId ?? "stripe",
    });

    await ctx.runMutation(internal.bookings.finaliseHotelBooking, {
      bookingId,
      success: !!result && result.status !== "failed",
      confirmationCode: result?.confirmationCode,
    });
  },
});
