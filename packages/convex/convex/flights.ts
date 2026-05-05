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

const PASSENGER = v.object({
  duffelId: v.string(),
  title: v.union(
    v.literal("mr"),
    v.literal("ms"),
    v.literal("mrs"),
    v.literal("miss"),
    v.literal("dr")
  ),
  firstName: v.string(),
  lastName: v.string(),
  gender: v.union(v.literal("m"), v.literal("f")),
  bornOn: v.string(), // YYYY-MM-DD
  email: v.string(),
  phoneE164: v.string(), // E.164 e.g. +447123456789
});

export const startBooking = action({
  args: {
    offerId: v.string(),
    passengers: v.array(PASSENGER),
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

    // Re-fetch the offer right before checkout — Duffel offers expire and
    // their price can change. We bind the booking to the latest snapshot.
    const offer = await ctx.runAction(internal.providers.duffel.getOfferDetail, {
      apiRef: args.offerId,
    });
    if (!offer) throw new Error("This flight is no longer available — search again.");

    if (args.passengers.length !== offer.passengers.length) {
      throw new Error(
        `This offer needs ${offer.passengers.length} passenger detail(s); received ${args.passengers.length}.`,
      );
    }

    // Map the form's passenger entries to Duffel's passenger ids in order.
    // Duffel doesn't tag passengers by name, only by an opaque id.
    const passengersWithIds = offer.passengers.map((p, i) => {
      const form = args.passengers[i];
      if (!form) throw new Error("Missing passenger details");
      return { ...form, duffelId: p.id };
    });

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
        passengers: passengersWithIds,
      },
    );
    return { bookingId, totalAmount: offer.totalAmount, currency: offer.currency, summary };
  },
});

// Internal — scheduled by bookings.confirmByStripeSession after Stripe payment
// is captured. Reads the passenger details captured at startBooking time and
// calls Duffel createOrder.
type StoredPassenger = {
  duffelId: string;
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  bornOn: string;
  email: string;
  phoneE164: string;
};

export const finalisePaidBooking = internalAction({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, { bookingId }): Promise<void> => {
    const booking = await ctx.runQuery(internal.bookings.getInternalBooking, {
      bookingId,
    });
    if (!booking) return;
    const offerId = booking.apiRef;
    const stored = (booking.rawResponse?.passengers ?? []) as StoredPassenger[];
    if (stored.length === 0) {
      await ctx.runMutation(internal.bookings.finaliseFlightBooking, {
        bookingId,
        success: false,
      });
      return;
    }
    const order = await ctx.runAction(internal.providers.duffel.createOrder, {
      offerId,
      passengers: stored.map((p) => ({
        id: p.duffelId,
        title: p.title,
        firstName: p.firstName,
        lastName: p.lastName,
        gender: p.gender,
        bornOn: p.bornOn,
        email: p.email,
        phoneE164: p.phoneE164,
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
