import { NextRequest, NextResponse } from "next/server";
import { fetchAction, fetchMutation } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

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
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as CheckoutBody;
  const origin = request.nextUrl.origin;

  if (body.type === "tickets") return handleTickets(body, origin, token);
  if (body.type === "hotel") return handleHotel(body, origin, token);
  if (body.type === "flight") return handleFlight(body, origin, token);
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

async function handleTickets(body: TicketsBody, origin: string, token: string) {
  if (!body.eventId || !body.items?.length) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await fetchMutation(
    api.bookings.createTicketBooking,
    { eventId: body.eventId, items: body.items },
    { token },
  );

  return await createSessionAndRespond({
    bookingId: result.bookingId,
    token,
    lineItems: result.lineItems.map((li) => ({
      name: li.name,
      unitAmountMinor: Math.round(li.unitAmount * 100),
      quantity: li.qty,
    })),
    currency: result.currency,
    successUrl: `${origin}/bookings/${result.bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/e/${body.eventSlug}?checkout=cancelled`,
    metadata: { bookingId: result.bookingId, type: "event_ticket" },
  });
}

async function handleFlight(body: FlightBody, origin: string, token: string) {
  if (!body.bookingId || !body.totalAmount || !body.currency) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  return await createSessionAndRespond({
    bookingId: body.bookingId,
    token,
    lineItems: [
      {
        name: body.summary,
        unitAmountMinor: Math.round(body.totalAmount * 100),
        quantity: 1,
      },
    ],
    currency: body.currency,
    successUrl: `${origin}/bookings/${body.bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}${body.backHref}?checkout=cancelled`,
    metadata: { bookingId: body.bookingId, type: "flight" },
  });
}

async function handleHotel(body: HotelBody, origin: string, token: string) {
  if (!body.bookingId || !body.totalAmount || !body.currency) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  return await createSessionAndRespond({
    bookingId: body.bookingId,
    token,
    lineItems: [
      {
        name: body.hotelName,
        unitAmountMinor: Math.round(body.totalAmount * 100),
        quantity: 1,
      },
    ],
    currency: body.currency,
    successUrl: `${origin}/bookings/${body.bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}${body.backHref}?checkout=cancelled`,
    metadata: { bookingId: body.bookingId, type: "hotel" },
  });
}

async function createSessionAndRespond(args: {
  bookingId: Id<"bookings">;
  token: string;
  lineItems: Array<{ name: string; unitAmountMinor: number; quantity: number }>;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}) {
  try {
    const { sessionId, url } = await fetchAction(
      api.payments.createCheckoutSession,
      {
        lineItems: args.lineItems,
        currency: args.currency,
        successUrl: args.successUrl,
        cancelUrl: args.cancelUrl,
        metadata: args.metadata,
      },
      { token: args.token },
    );
    await fetchMutation(
      api.bookings.attachStripeSession,
      { bookingId: args.bookingId, stripeSessionId: sessionId },
      { token: args.token },
    );
    return NextResponse.json({ url, bookingId: args.bookingId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not start checkout";
    const status = msg.toLowerCase().includes("payments aren't configured") ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
