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

/**
 * Returns the raw LiteAPI hotels/rates response body for a single
 * hotel. The mobile detail screen renders the full
 * `LiteAPIHotelRatesResponse` shape (roomTypes → rates →
 * cancellationPolicies), so this action is a thin proxy that just
 * authenticates the caller, hides the API key, and forwards the
 * response. Callers should treat this as best-effort: when the LiteAPI
 * key isn't configured or the fetch fails we return null and the UI
 * degrades to "no rates available".
 */
export const getRatesRaw = action({
  args: {
    apiRef: v.string(),
    checkin: v.string(),
    checkout: v.string(),
    adults: v.optional(v.number()),
    currency: v.optional(v.string()),
    guestNationality: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<unknown> => {
    const apiKey = process.env.LITEAPI_KEY;
    if (!apiKey) return null;
    try {
      const res = await fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotelIds: [args.apiRef],
          checkin: args.checkin,
          checkout: args.checkout,
          currency: args.currency ?? "USD",
          guestNationality: args.guestNationality ?? "US",
          occupancies: [{ adults: args.adults ?? 2 }],
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.warn("[liteapi] getRatesRaw not ok", res.status, txt.slice(0, 200));
        return null;
      }
      return (await res.json()) as unknown;
    } catch (err) {
      console.warn("[liteapi] getRatesRaw fetch failed", err);
      return null;
    }
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
    offerId: v.string(),
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
    /**
     * Stripe client_secret issued by LiteAPI's Stripe account. The mobile
     * client passes this to @stripe/stripe-react-native's initPaymentSheet
     * — LiteAPI is merchant of record, so the user's card is charged from
     * their Stripe account, not Runwae's.
     */
    secretKey: string;
  }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    if (!args.offerId) {
      throw new Error("This room is no longer available — try another.");
    }

    const pre = await ctx.runAction(internal.providers.liteapi.prebook, {
      offerId: args.offerId,
    });
    if (!pre.ok || !pre.prebookId || pre.finalPrice === undefined || !pre.currency) {
      throw new Error(pre.reason ?? "This room is no longer available — try another.");
    }
    if (!pre.secretKey || !pre.transactionId) {
      throw new Error(
        "Payment setup failed — please try again or contact support.",
      );
    }

    // The user pays `finalPrice` (LiteAPI's retail rate, which already
    // includes the margin LiteAPI returned via the rates request). Runwae
    // is paid that margin weekly by LiteAPI after guest checkout. We track
    // it on the row so the host split (via finaliseHotelBooking) splits
    // the right amount.
    //
    // Margin is computed by LiteAPI server-side; on the rates response
    // it's the difference between retailRate.total and the net price.
    // Without that exposed in prebook, fall back to a flat 10% bookkeeping
    // estimate until rates carries an explicit margin field through.
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
        liteapiTransactionId: pre.transactionId,
      },
    );

    return {
      bookingId,
      finalPrice: pre.finalPrice,
      currency: pre.currency,
      secretKey: pre.secretKey,
    };
  },
});

/**
 * Mobile callback after the LiteAPI Stripe Payment Sheet succeeds.
 * Calls LiteAPI book() and flips the Convex booking status. Idempotent
 * — re-running on a confirmed booking is a no-op so the client can
 * retry safely if the network drops mid-call.
 *
 * NOTE: when LiteAPI is merchant of record (Payment SDK mode), Runwae's
 * Stripe webhook does NOT fire for these payments. This action is the
 * single source of truth. If the user closes the app between Payment
 * Sheet success and this call landing, the money is captured but the
 * booking stays pending — reconciliation is currently manual via the
 * LiteAPI dashboard until we wire LiteAPI webhooks.
 */
export const confirmAfterPayment = action({
  args: {
    bookingId: v.id("bookings"),
    holderFirstName: v.string(),
    holderLastName: v.string(),
    holderEmail: v.string(),
  },
  handler: async (ctx, args): Promise<{ status: string; confirmationCode?: string }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const booking = await ctx.runQuery(internal.bookings.getInternalBooking, {
      bookingId: args.bookingId,
    });
    if (!booking) throw new Error("Booking not found");
    if (booking.userId !== userId) throw new Error("Forbidden");
    if (booking.status === "confirmed") {
      return {
        status: "confirmed",
        confirmationCode: booking.rawResponse?.liteapiConfirmationCode as
          | string
          | undefined,
      };
    }

    const prebookId = booking.rawResponse?.prebookId as string | undefined;
    const transactionId = booking.rawResponse?.liteapiTransactionId as
      | string
      | undefined;
    if (!prebookId || !transactionId) {
      await ctx.runMutation(internal.bookings.finaliseHotelBooking, {
        bookingId: args.bookingId,
        success: false,
      });
      throw new Error("Booking is missing payment metadata. Please contact support.");
    }

    const result = await ctx.runAction(internal.providers.liteapi.book, {
      prebookId,
      holderFirstName: args.holderFirstName,
      holderLastName: args.holderLastName,
      holderEmail: args.holderEmail,
      transactionId,
    });

    const success = !!result && result.status !== "failed";
    await ctx.runMutation(internal.bookings.finaliseHotelBooking, {
      bookingId: args.bookingId,
      success,
      confirmationCode: result?.confirmationCode,
    });
    if (!success) {
      throw new Error(
        "Your payment was received but the hotel reservation failed. We've flagged this for our team to refund or rebook.",
      );
    }
    return {
      status: "confirmed",
      confirmationCode: result?.confirmationCode,
    };
  },
});

// Legacy — scheduled by bookings.confirmByStripeSession after a Stripe
// webhook fires on Runwae's account. Used by the previous merchant-of-
// record flow (`ACC_CREDIT_CARD`) where Runwae captured payment via its
// own Stripe and then billed LiteAPI. Kept so any in-flight bookings
// from before the SDK migration still confirm cleanly — new bookings
// route through `confirmAfterPayment` instead.
//
// Will be deletable once no `pending` rows have stripePaymentIntentId
// set (i.e. after the LiteAPI SDK is fully rolled out and old rows have
// either confirmed, cancelled, or aged out).
export const finalisePaidBooking = internalAction({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, { bookingId }): Promise<void> => {
    const booking = await ctx.runQuery(internal.bookings.getInternalBooking, {
      bookingId,
    });
    if (!booking) return;
    const prebookId = booking.rawResponse?.prebookId as string | undefined;
    const transactionId =
      (booking.rawResponse?.liteapiTransactionId as string | undefined) ??
      booking.stripePaymentIntentId;
    if (!prebookId || !transactionId) {
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
      transactionId,
    });

    await ctx.runMutation(internal.bookings.finaliseHotelBooking, {
      bookingId,
      success: !!result && result.status !== "failed",
      confirmationCode: result?.confirmationCode,
    });
  },
});
