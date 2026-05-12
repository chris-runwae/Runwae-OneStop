import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().email(),
  source: z.string().max(64).optional(),
  hp: z.string().max(0).optional(),
});

const RESEND_KEY = process.env.RESEND_API_KEY;
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Honeypot — silently succeed for bots.
  if (parsed.hp && parsed.hp.length > 0) {
    return new NextResponse(null, { status: 204 });
  }

  if (!RESEND_KEY || !AUDIENCE_ID) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[waitlist] RESEND_API_KEY or RESEND_AUDIENCE_ID not set — skipping send"
      );
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(RESEND_KEY);
    await resend.contacts.create({
      email: parsed.email,
      audienceId: AUDIENCE_ID,
      unsubscribed: false,
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[waitlist] Resend error", err);
    return NextResponse.json(
      { error: "We couldn't add you right now." },
      { status: 502 }
    );
  }
}
