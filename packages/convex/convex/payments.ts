import { v } from "convex/values";
import { internalAction } from "./_generated/server";

// Stripe refund via REST API — kept off the Node runtime so it shares the
// default Convex environment with the rest of bookings logic.
//
// Triggered from booking finalisers when a downstream provider (LiteAPI,
// Duffel) rejects the booking after we've already captured payment.
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
