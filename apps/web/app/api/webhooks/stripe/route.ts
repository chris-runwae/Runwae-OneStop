import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      // TODO: fetchMutation(api.bookings.confirmByStripeSession, { sessionId: event.data.object.id })
      break;
    }
    case "payment_intent.payment_failed": {
      // TODO: fetchMutation(api.bookings.failByPaymentIntent, { paymentIntentId: event.data.object.id })
      break;
    }
  }

  return NextResponse.json({ received: true });
}
