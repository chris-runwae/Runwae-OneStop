// Stripe webhook handler — runs as a Convex HTTP action so STRIPE_SECRET_KEY
// and STRIPE_WEBHOOK_SECRET only need to live in the Convex deployment env.
//
// Verifies the Stripe signature manually so we don't have to drag the Stripe
// SDK into the runtime — Stripe's signing scheme is HMAC-SHA256 over
// `${timestamp}.${rawBody}` with the webhook secret.
//
// Path on the Convex deployment: <CONVEX_SITE_URL>/stripe/webhook
// Configure Stripe → Webhooks to send events here. In dev with `stripe listen`,
// forward to that URL too (e.g. `stripe listen --forward-to <CONVEX_SITE_URL>/stripe/webhook`).

import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

async function verifyStripeSignature(
  body: string,
  sigHeader: string | null,
  secret: string,
): Promise<{ ok: true; event: any } | { ok: false; reason: string }> {
  if (!sigHeader) return { ok: false, reason: "Missing signature" };
  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i), p.slice(i + 1)];
    }),
  ) as Record<string, string>;
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return { ok: false, reason: "Malformed signature header" };

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${body}`));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time compare.
  if (expected.length !== v1.length) return { ok: false, reason: "Bad signature" };
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  }
  if (diff !== 0) return { ok: false, reason: "Bad signature" };

  // Reject events older than 5 minutes to thwart replay.
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) {
    return { ok: false, reason: "Stale event" };
  }

  try {
    return { ok: true, event: JSON.parse(body) };
  } catch {
    return { ok: false, reason: "Invalid JSON" };
  }
}

export const handleStripeWebhook = httpAction(async (ctx, request) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response(JSON.stringify({ error: "Webhook not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const verified = await verifyStripeSignature(body, sig, secret);
  if (!verified.ok) {
    return new Response(JSON.stringify({ error: verified.reason }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const event = verified.event as { type: string; data: { object: any } };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
      if (paymentIntentId) {
        await ctx.runMutation(api.bookings.confirmByStripeSession, {
          sessionId: String(session.id),
          paymentIntentId,
        });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      await ctx.runMutation(api.bookings.failByPaymentIntent, {
        paymentIntentId: String(intent.id),
      });
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
