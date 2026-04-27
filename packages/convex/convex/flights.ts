import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { DiscoveryItem } from "./providers/types";
import type { DuffelOfferDetail } from "./providers/duffel";

export const search = action({
  args: {
    originIata: v.string(),
    destinationIata: v.string(),
    depart: v.string(),
    returnDate: v.optional(v.string()),
    adults: v.optional(v.number()),
    limit: v.optional(v.number()),
    sortBy: v.optional(
      v.union(v.literal("price_asc"), v.literal("price_desc"), v.literal("departure"))
    ),
  },
  handler: async (ctx, args): Promise<DiscoveryItem[]> => {
    const items: DiscoveryItem[] = await ctx.runAction(
      internal.providers.duffel.search,
      {
        category: "fly",
        term: args.destinationIata,
        limit: args.limit ?? 20,
        checkin: args.depart,
        checkout: args.returnDate,
        originIata: args.originIata,
        destinationIata: args.destinationIata,
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
      case "departure":
        // Best-effort: we don't have explicit departure here; offers carry it
        // in description. Falls back to provider order.
        break;
    }
    return sorted;
  },
});

export const getOffer = action({
  args: { apiRef: v.string() },
  handler: async (ctx, args): Promise<DuffelOfferDetail | null> => {
    return await ctx.runAction(internal.providers.duffel.getOfferDetail, {
      apiRef: args.apiRef,
    });
  },
});

export const startBooking = action({
  args: {
    offerId: v.string(),
    eventId: v.optional(v.id("events")),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    bookingId: string;
    totalAmount: number;
    currency: string;
    summary: string;
  }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const offer = await ctx.runAction(internal.providers.duffel.getOfferDetail, {
      apiRef: args.offerId,
    });
    if (!offer) throw new Error("Offer no longer available");

    const summary = offer.segments
      .map((s) => `${s.origin}→${s.destination}`)
      .join(" · ");

    // Commission: 3% of flight revenue (Duffel partner cut).
    const commission = Math.round(offer.totalAmount * 0.03);
    const bookingId: string = await ctx.runMutation(
      internal.bookings.createPendingFlight,
      {
        userId,
        apiSource: "duffel",
        apiRef: args.offerId,
        carrier: offer.carrier,
        summary,
        grossAmount: offer.totalAmount,
        currency: offer.currency,
        commissionAmount: commission,
        eventId: args.eventId,
        passengerIds: offer.passengers.map((p) => p.id),
      },
    );
    return { bookingId, totalAmount: offer.totalAmount, currency: offer.currency, summary };
  },
});

// Internal — scheduled by bookings.confirmByStripeSession after Stripe payment
// is captured. Calls Duffel createOrder, writes the result back.
export const finalisePaidBooking = internalAction({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, { bookingId }): Promise<void> => {
    const booking = await ctx.runQuery(internal.bookings.getInternalBooking, {
      bookingId,
    });
    if (!booking) return;
    const offerId = booking.apiRef;
    const passengerIds: string[] = booking.rawResponse?.passengerIds ?? [];
    const holder = await ctx.runQuery(internal.bookings.getBookingHolder, {
      userId: booking.userId,
    });
    const order = await ctx.runAction(internal.providers.duffel.createOrder, {
      offerId,
      passengers: passengerIds.map((id) => ({
        id,
        title: "mr",
        firstName: holder.firstName,
        lastName: holder.lastName,
        gender: "m",
        bornOn: "1990-01-01",
        email: holder.email,
        phoneE164: "+440000000000",
      })),
      paymentAmount: booking.grossAmount,
      paymentCurrency: booking.currency,
    });
    await ctx.runMutation(internal.bookings.finaliseFlightBooking, {
      bookingId,
      success: !!order,
      orderId: order?.orderId,
      bookingReference: order?.bookingReference,
    });
  },
});
