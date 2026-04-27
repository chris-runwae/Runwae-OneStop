import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

const BOOKING_TYPE = v.union(
  v.literal("flight"),
  v.literal("hotel"),
  v.literal("tour"),
  v.literal("car_rental"),
  v.literal("event_ticket")
);

const PLATFORM_TICKET_COMMISSION_PCT = 5; // 5% Runwae cut on every ticket sale

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

// Internal — used by the hotel finalise action so it can read the booking row
// without going through user auth.
export const getInternalBooking = internalQuery({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookingId);
  },
});

// Internal — split a user's display name into the first/last/email triple
// LiteAPI's book endpoint requires.
export const getBookingHolder = internalQuery({
  args: { userId: v.id("users") },
  handler: async (
    ctx,
    args,
  ): Promise<{ firstName: string; lastName: string; email: string }> => {
    const user = await ctx.db.get(args.userId);
    const fullName = user?.name?.trim() ?? "Guest";
    const parts = fullName.split(/\s+/);
    const firstName = parts[0] ?? "Guest";
    const lastName = parts.slice(1).join(" ") || "Guest";
    return {
      firstName,
      lastName,
      email: user?.email ?? "noreply@runwae.com",
    };
  },
});

// Public read used by checkout API + success page.
export const getById = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const booking = await ctx.db.get(args.bookingId);
    if (!booking || booking.userId !== userId) return null;
    return booking;
  },
});

// Tickets selected by the buyer; price/currency are server-validated against
// the live tier rows so the client can't tamper with the cart total.
export const createTicketBooking = mutation({
  args: {
    eventId: v.id("events"),
    items: v.array(
      v.object({ tierId: v.id("event_ticket_tiers"), qty: v.number() })
    ),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    bookingId: Id<"bookings">;
    currency: string;
    lineItems: Array<{ name: string; unitAmount: number; qty: number }>;
    totalAmount: number;
  }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    if (args.items.length === 0) throw new Error("No tickets selected");

    const event = await ctx.db.get(args.eventId);
    if (!event || event.status !== "published") throw new Error("Event not available");

    const lineItems: Array<{ name: string; unitAmount: number; qty: number }> = [];
    let total = 0;
    let currency: string | null = null;

    for (const item of args.items) {
      if (item.qty <= 0) continue;
      const tier = await ctx.db.get(item.tierId);
      if (!tier || tier.eventId !== args.eventId) {
        throw new Error("Invalid ticket tier");
      }
      if (!tier.isVisible) throw new Error(`${tier.name} not on sale`);
      const remaining = tier.quantity - tier.quantitySold;
      if (item.qty > remaining) throw new Error(`${tier.name}: only ${remaining} left`);
      const cap = tier.maxPerOrder ?? 8;
      if (item.qty > cap) throw new Error(`${tier.name}: max ${cap} per order`);

      currency ??= tier.currency;
      if (currency !== tier.currency) throw new Error("Mixed-currency tiers not supported");

      lineItems.push({
        name: `${event.name} — ${tier.name}`,
        unitAmount: tier.price,
        qty: item.qty,
      });
      total += tier.price * item.qty;
    }

    if (lineItems.length === 0) throw new Error("No tickets selected");
    if (currency === null) throw new Error("Could not determine currency");

    // Use the event's commission split for the host share, plus a flat platform
    // cut. For simplicity we pre-compute the commission amount here — the
    // commissions row is created on confirmation.
    const commission = Math.round(total * (PLATFORM_TICKET_COMMISSION_PCT / 100));

    const bookingId = await ctx.db.insert("bookings", {
      userId,
      eventId: args.eventId,
      type: "event_ticket",
      apiSource: "stripe",
      apiRef: "", // Filled in once Stripe Checkout session is created
      grossAmount: total,
      currency,
      commissionAmount: commission,
      status: "pending",
      bookedAt: Date.now(),
      rawResponse: { items: args.items },
    });

    return { bookingId, currency, lineItems, totalAmount: total };
  },
});

// Called from flights.startBooking after a Duffel offer lookup. Stores the
// offerId (apiRef) + passenger ids so finaliseFlightBooking can call Duffel
// create-order once Stripe payment lands.
export const createPendingFlight = internalMutation({
  args: {
    userId: v.id("users"),
    apiSource: v.string(),
    apiRef: v.string(),
    carrier: v.string(),
    summary: v.string(),
    grossAmount: v.number(),
    currency: v.string(),
    commissionAmount: v.number(),
    eventId: v.optional(v.id("events")),
    passengerIds: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"bookings">> => {
    return await ctx.db.insert("bookings", {
      userId: args.userId,
      eventId: args.eventId,
      type: "flight",
      apiSource: args.apiSource,
      apiRef: args.apiRef,
      grossAmount: args.grossAmount,
      currency: args.currency,
      commissionAmount: args.commissionAmount,
      status: "pending",
      bookedAt: Date.now(),
      rawResponse: {
        carrier: args.carrier,
        summary: args.summary,
        passengerIds: args.passengerIds,
      },
    });
  },
});

export const finaliseFlightBooking = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    success: v.boolean(),
    orderId: v.optional(v.string()),
    bookingReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return;
    if (!args.success) {
      await ctx.db.patch(args.bookingId, {
        status: "cancelled",
        rawResponse: { ...(booking.rawResponse ?? {}), duffelOrderFailed: true },
      });
      return;
    }
    await ctx.db.patch(args.bookingId, {
      status: "confirmed",
      rawResponse: {
        ...(booking.rawResponse ?? {}),
        duffelOrderId: args.orderId,
        duffelBookingReference: args.bookingReference,
      },
    });
    await ctx.db.insert("commissions", {
      bookingId: booking._id,
      eventId: booking.eventId,
      hostId: undefined,
      totalCommission: booking.commissionAmount,
      runwaeShare: booking.commissionAmount,
      hostShare: 0,
      splitPct: 3,
      currency: booking.currency,
      status: "pending",
      createdAt: Date.now(),
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

// Called from hotels.startBooking after a successful LiteAPI prebook. Stores
// prebookId + dates in rawResponse so confirmByStripeSession can finalise the
// hotel reservation via LiteAPI once payment lands.
export const createPendingHotel = internalMutation({
  args: {
    userId: v.id("users"),
    apiSource: v.string(),
    apiRef: v.string(),
    prebookId: v.string(),
    hotelName: v.string(),
    checkin: v.string(),
    checkout: v.string(),
    grossAmount: v.number(),
    currency: v.string(),
    commissionAmount: v.number(),
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args): Promise<Id<"bookings">> => {
    return await ctx.db.insert("bookings", {
      userId: args.userId,
      eventId: args.eventId,
      type: "hotel",
      apiSource: args.apiSource,
      apiRef: args.apiRef,
      grossAmount: args.grossAmount,
      currency: args.currency,
      commissionAmount: args.commissionAmount,
      status: "pending",
      bookedAt: Date.now(),
      rawResponse: {
        prebookId: args.prebookId,
        hotelName: args.hotelName,
        checkin: args.checkin,
        checkout: args.checkout,
      },
    });
  },
});

// Called by /api/checkout once the Stripe Checkout Session exists, so we can
// match the webhook back to this booking.
export const attachStripeSession = mutation({
  args: {
    bookingId: v.id("bookings"),
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const booking = await ctx.db.get(args.bookingId);
    if (!booking || booking.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.bookingId, { apiRef: args.stripeSessionId });
  },
});

// Called from the Stripe webhook (Next.js route) once the signature has been
// verified — no auth required, but only matches if the session id is one we
// minted ourselves.
export const confirmByStripeSession = mutation({
  args: {
    sessionId: v.string(),
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find by apiRef = session id. No index needed; tickets table will stay
    // small per checkout window.
    const booking: Doc<"bookings"> | null = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("apiRef"), args.sessionId))
      .first();
    if (!booking) return; // Webhook fired for something we didn't mint
    if (booking.status === "confirmed") return; // Idempotent

    if (booking.type === "event_ticket" && booking.eventId) {
      await ctx.db.patch(booking._id, {
        status: "confirmed",
        stripePaymentIntentId: args.paymentIntentId,
      });
      const items = (booking.rawResponse?.items ?? []) as Array<{
        tierId: Id<"event_ticket_tiers">;
        qty: number;
      }>;
      for (const item of items) {
        const tier = await ctx.db.get(item.tierId);
        if (!tier) continue;
        await ctx.db.patch(item.tierId, {
          quantitySold: tier.quantitySold + item.qty,
        });
        // Issue ticket rows so the buyer has scannable codes.
        for (let i = 0; i < item.qty; i++) {
          await ctx.db.insert("event_tickets", {
            eventId: booking.eventId,
            tierId: item.tierId,
            userId: booking.userId,
            bookingId: booking._id,
            ticketCode: `TKT-${booking._id}-${item.tierId}-${i}`,
            status: "active",
            issuedAt: Date.now(),
          });
        }
      }
    } else if (booking.type === "hotel") {
      // Hotel: stay 'pending' until LiteAPI book succeeds. Stripe payment is
      // captured but the room isn't reserved with the supplier yet.
      await ctx.db.patch(booking._id, {
        stripePaymentIntentId: args.paymentIntentId,
      });
      await ctx.scheduler.runAfter(0, internal.hotels.finalisePaidBooking, {
        bookingId: booking._id,
      });
      // Commission + notification are deferred to the finalise step.
      return;
    } else if (booking.type === "flight") {
      // Flight: same defer pattern — Duffel order creation runs post-payment.
      await ctx.db.patch(booking._id, {
        stripePaymentIntentId: args.paymentIntentId,
      });
      await ctx.scheduler.runAfter(0, internal.flights.finalisePaidBooking, {
        bookingId: booking._id,
      });
      return;
    }

    await ctx.db.insert("commissions", {
      bookingId: booking._id,
      eventId: booking.eventId,
      hostId: undefined,
      totalCommission: booking.commissionAmount,
      runwaeShare: booking.commissionAmount,
      hostShare: 0,
      splitPct: PLATFORM_TICKET_COMMISSION_PCT,
      currency: booking.currency,
      status: "pending",
      createdAt: Date.now(),
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

// Internal — called by confirmByStripeSession after Stripe payment is captured
// for a hotel booking. Looks up the prebookId, calls LiteAPI book, then either
// confirms the booking + writes commission/notification, or marks it failed
// (Stripe payment will need to be refunded out-of-band).
export const finaliseHotelBooking = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    confirmationCode: v.optional(v.string()),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return;
    if (!args.success) {
      await ctx.db.patch(args.bookingId, {
        status: "cancelled",
        rawResponse: { ...(booking.rawResponse ?? {}), liteapiBookFailed: true },
      });
      return;
    }
    await ctx.db.patch(args.bookingId, {
      status: "confirmed",
      rawResponse: {
        ...(booking.rawResponse ?? {}),
        liteapiConfirmationCode: args.confirmationCode,
      },
    });
    await ctx.db.insert("commissions", {
      bookingId: booking._id,
      eventId: booking.eventId,
      hostId: undefined,
      totalCommission: booking.commissionAmount,
      runwaeShare: booking.commissionAmount,
      hostShare: 0,
      splitPct: 10,
      currency: booking.currency,
      status: "pending",
      createdAt: Date.now(),
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

export const failByPaymentIntent = mutation({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("stripePaymentIntentId"), args.paymentIntentId))
      .first();
    if (!booking || booking.status === "cancelled") return;
    await ctx.db.patch(booking._id, { status: "cancelled" });
  },
});
