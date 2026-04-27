import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { fetchMutation } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

type TicketsBody = {
  type: "tickets";
  eventId: Id<"events">;
  eventSlug: string;
  items: Array<{ tierId: Id<"event_ticket_tiers">; qty: number }>;
};

type HotelBody = {
  type: "hotel";
  bookingId: Id<"bookings">;
  hotelName: string;
  totalAmount: number;
  currency: string;
  backHref: string;
};

type FlightBody = {
  type: "flight";
  bookingId: Id<"bookings">;
  summary: string;
  totalAmount: number;
  currency: string;
  backHref: string;
};

type CheckoutBody = TicketsBody | HotelBody | FlightBody;

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments aren't configured. Set STRIPE_SECRET_KEY and try again." },
      { status: 503 },
    );
  }

  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as CheckoutBody;
  const origin = request.nextUrl.origin;

  if (body.type === "tickets") {
    return handleTickets(body, origin, token, stripe);
  }
  if (body.type === "hotel") {
    return handleHotel(body, origin, token, stripe);
  }
  if (body.type === "flight") {
    return handleFlight(body, origin, token, stripe);
  }
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

async function handleTickets(body: TicketsBody, origin: string, token: string, stripe: Stripe) {
  if (!body.eventId || !body.items?.length) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await fetchMutation(
    api.bookings.createTicketBooking,
    { eventId: body.eventId, items: body.items },
    { token }
  );

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: result.lineItems.map((li) => ({
      price_data: {
        currency: result.currency.toLowerCase(),
        product_data: { name: li.name },
        unit_amount: Math.round(li.unitAmount * 100),
      },
      quantity: li.qty,
    })),
    success_url: `${origin}/bookings/${result.bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/e/${body.eventSlug}?checkout=cancelled`,
    metadata: { bookingId: result.bookingId, type: "event_ticket" },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return URL" }, { status: 500 });
  }

  await fetchMutation(
    api.bookings.attachStripeSession,
    { bookingId: result.bookingId, stripeSessionId: session.id },
    { token }
  );

  return NextResponse.json({ url: session.url, bookingId: result.bookingId });
}

async function handleFlight(body: FlightBody, origin: string, token: string, stripe: Stripe) {
  if (!body.bookingId || !body.totalAmount || !body.currency) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: body.currency.toLowerCase(),
          product_data: { name: body.summary },
          unit_amount: Math.round(body.totalAmount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/bookings/${body.bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${body.backHref}?checkout=cancelled`,
    metadata: { bookingId: body.bookingId, type: "flight" },
  });
  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return URL" }, { status: 500 });
  }
  await fetchMutation(
    api.bookings.attachStripeSession,
    { bookingId: body.bookingId, stripeSessionId: session.id },
    { token }
  );
  return NextResponse.json({ url: session.url, bookingId: body.bookingId });
}

async function handleHotel(body: HotelBody, origin: string, token: string, stripe: Stripe) {
  if (!body.bookingId || !body.totalAmount || !body.currency) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: body.currency.toLowerCase(),
          product_data: { name: body.hotelName },
          unit_amount: Math.round(body.totalAmount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/bookings/${body.bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${body.backHref}?checkout=cancelled`,
    metadata: { bookingId: body.bookingId, type: "hotel" },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return URL" }, { status: 500 });
  }

  await fetchMutation(
    api.bookings.attachStripeSession,
    { bookingId: body.bookingId, stripeSessionId: session.id },
    { token }
  );

  return NextResponse.json({ url: session.url, bookingId: body.bookingId });
}
