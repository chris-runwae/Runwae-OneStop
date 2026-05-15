import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action, internalAction, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { DiscoveryItem } from "./providers/types";
import { POPULAR_DESTINATIONS, type DuffelOfferDetail } from "./providers/duffel";

// Markup applied on top of Duffel's airline quote when the user pays. The
// user is charged offer.totalAmount * (1 + FLIGHT_MARKUP_PCT/100); Duffel
// Balance is charged offer.totalAmount; the difference is Runwae's margin
// minus Stripe fees. Match the events ticketing commission default at 5%.
//
// Per-event overrides happen via events.commissionSplitPct at commission-
// recording time — that's the host split of THIS margin, not a flight-rate
// override. If a host wants a different flight markup, it ships as a
// follow-up (need an events.flightMarkupPct column).
const FLIGHT_MARKUP_PCT = 5;

// Curated list surfaced in the mobile flight search picker. Same source the
// Duffel exploration mode uses, exposed publicly so the client doesn't need
// to duplicate it.
export const popularAirports = query({
  args: {},
  handler: async (): Promise<
    ReadonlyArray<{
      iata: string;
      city: string;
      name?: string;
      country?: string;
    }>
  > => {
    return POPULAR_DESTINATIONS;
  },
});

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

    // User pays the airline amount + Runwae's markup. The markup is the
    // commission (real money, not a 3% bookkeeping fiction like before).
    // Duffel Balance is later charged the raw airline amount — see
    // finalisePaidBooking.
    const airlineAmount = offer.totalAmount;
    const userAmount = Math.round(
      airlineAmount * (1 + FLIGHT_MARKUP_PCT / 100) * 100,
    ) / 100;
    const commission = Math.round((userAmount - airlineAmount) * 100) / 100;

    const bookingId: string = await ctx.runMutation(
      internal.bookings.createPendingFlight,
      {
        userId,
        apiSource: "duffel",
        apiRef: args.offerId,
        carrier: offer.carrier,
        summary,
        grossAmount: userAmount,
        currency: offer.currency,
        commissionAmount: commission,
        eventId: args.eventId,
        passengers: passengersWithIds,
        airlineAmount,
      },
    );
    return {
      bookingId,
      totalAmount: userAmount,
      currency: offer.currency,
      summary,
    };
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
    // Duffel Balance is settled in the AIRLINE amount, not the user-paid
    // amount. Fall back to grossAmount for rows created before the
    // airlineAmount split landed — those bookings have markup = 0 anyway.
    const airlineAmount =
      (booking.rawResponse?.airlineAmount as number | undefined) ??
      booking.grossAmount;
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
      paymentAmount: airlineAmount,
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
