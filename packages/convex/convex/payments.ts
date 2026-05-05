import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Stripe refund via REST API — kept off the Node runtime so it shares the
// default Convex environment with the rest of bookings logic.
//
// Triggered from booking finalisers when a downstream provider (LiteAPI,
// Duffel) rejects the booking after we've already captured payment.
// Create a Stripe Checkout Session entirely from Convex so the secret key
// only needs to live in the Convex deployment env. The Next.js /api/checkout
// route still owns auth, origin handling, and the booking lifecycle — it
// just delegates the Stripe call here. Uses the REST API directly to avoid
// pulling the Stripe SDK into Convex's bundle.
export const createCheckoutSession = action({
  args: {
    lineItems: v.array(
      v.object({
        name: v.string(),
        unitAmountMinor: v.number(),
        quantity: v.number(),
      }),
    ),
    currency: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
    metadata: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ sessionId: string; url: string }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) throw new Error("Payments aren't configured. Set STRIPE_SECRET_KEY in Convex env.");

    // Stripe accepts deeply nested params as repeated form-encoded keys.
    // URLSearchParams handles repeated keys but not nested object syntax,
    // so we build the body string manually.
    const params: Array<[string, string]> = [
      ["mode", "payment"],
      ["payment_method_types[0]", "card"],
      ["success_url", args.successUrl],
      ["cancel_url", args.cancelUrl],
    ];
    args.lineItems.forEach((li, i) => {
      params.push([`line_items[${i}][price_data][currency]`, args.currency.toLowerCase()]);
      params.push([`line_items[${i}][price_data][product_data][name]`, li.name]);
      params.push([
        `line_items[${i}][price_data][unit_amount]`,
        String(Math.round(li.unitAmountMinor)),
      ]);
      params.push([`line_items[${i}][quantity]`, String(li.quantity)]);
    });
    if (args.metadata) {
      for (const [k, val] of Object.entries(args.metadata)) {
        params.push([`metadata[${k}]`, val]);
      }
    }
    const body = params
      .map(([k, vv]) => `${encodeURIComponent(k)}=${encodeURIComponent(vv)}`)
      .join("&");

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const json = (await res.json()) as {
      id?: string;
      url?: string;
      error?: { message?: string };
    };
    if (!res.ok || !json.id || !json.url) {
      const msg = json.error?.message ?? `Stripe rejected the session (${res.status})`;
      console.error("[stripe] checkout session failed", msg);
      throw new Error(msg);
    }
    return { sessionId: json.id, url: json.url };
  },
});

// Cancel an active Stripe subscription at the end of the current billing
// period. We don't terminate immediately because the user has already paid
// for the current period and is entitled to use it. Used by the
// account-deletion flow.
export const cancelStripeSubscription = internalAction({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (
    _ctx,
    { stripeSubscriptionId },
  ): Promise<{ ok: boolean; error?: string }> => {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) return { ok: false, error: "Stripe not configured" };
    try {
      const body = new URLSearchParams({ cancel_at_period_end: "true" });
      const res = await fetch(
        `https://api.stripe.com/v1/subscriptions/${encodeURIComponent(stripeSubscriptionId)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        },
      );
      const json = (await res.json()) as {
        id?: string;
        error?: { message?: string };
      };
      if (!res.ok || !json.id) {
        const err =
          json.error?.message ?? `Subscription cancel failed (${res.status})`;
        console.error("[stripe] subscription cancel failed", err);
        return { ok: false, error: err };
      }
      return { ok: true };
    } catch (err) {
      console.error("[stripe] subscription cancel error", err);
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  },
});

export const refundStripePayment = internalAction({
  args: {
    paymentIntentId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (
    _ctx,
    { paymentIntentId, reason },
  ): Promise<{ ok: boolean; refundId?: string; error?: string }> => {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) return { ok: false, error: "Stripe not configured" };
    try {
      const body = new URLSearchParams({
        payment_intent: paymentIntentId,
        reason: "requested_by_customer",
      });
      if (reason) body.set("metadata[failure_reason]", reason);

      const res = await fetch("https://api.stripe.com/v1/refunds", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      const json = (await res.json()) as { id?: string; error?: { message?: string } };
      if (!res.ok || !json.id) {
        const err = json.error?.message ?? `Refund failed (${res.status})`;
        console.error("[stripe] refund failed", err);
        return { ok: false, error: err };
      }
      return { ok: true, refundId: json.id };
    } catch (err) {
      console.error("[stripe] refund error", err);
      return { ok: false, error: err instanceof Error ? err.message : "Network error" };
    }
  },
});
