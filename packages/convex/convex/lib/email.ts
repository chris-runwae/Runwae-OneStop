// Direct Resend REST integration. We hit the API by fetch instead of
// pulling in the resend npm package so the Convex bundle stays
// lightweight. RESEND_API_KEY + RESEND_FROM live on the Convex
// deployment env. When either is absent we log the intended payload
// instead of throwing — mutations must never fail because dev hasn't
// configured email yet.

const DEFAULT_FROM = "Runwae <noreply@runwae.io>";

async function sendViaResend(args: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; stubbed: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[email:stub] no RESEND_API_KEY", {
      to: args.to,
      subject: args.subject,
    });
    return { ok: true, stubbed: true };
  }
  const from = process.env.RESEND_FROM ?? DEFAULT_FROM;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        ...(args.text ? { text: args.text } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn("[email] Resend rejected", res.status, body);
      return { ok: false, stubbed: false };
    }
    return { ok: true, stubbed: false };
  } catch (err) {
    console.warn("[email] Resend fetch failed", err);
    return { ok: false, stubbed: false };
  }
}

export type EventStatusEmailKind =
  | "event_cancelled"
  | "event_completed";

export interface EventStatusEmailPayload {
  kind: EventStatusEmailKind;
  to: string | null;
  hostName: string | null;
  eventName: string;
  eventSlug: string;
}

export async function sendEventStatusEmail(
  payload: EventStatusEmailPayload,
): Promise<{ ok: boolean; stubbed: boolean }> {
  if (!payload.to) return { ok: true, stubbed: true };
  const subject =
    payload.kind === "event_cancelled"
      ? `Your event "${payload.eventName}" was cancelled`
      : `Your event "${payload.eventName}" is marked complete`;
  const greeting = payload.hostName ? `Hi ${payload.hostName},` : "Hi there,";
  const body =
    payload.kind === "event_cancelled"
      ? `${greeting}<br/><br/>Your event <strong>${payload.eventName}</strong> has been cancelled. Attendees have been notified.`
      : `${greeting}<br/><br/>Your event <strong>${payload.eventName}</strong> has been marked as completed. Thanks for hosting!`;
  return await sendViaResend({
    to: payload.to,
    subject,
    html: `<p style="font-family:system-ui,sans-serif">${body}</p>`,
    text: body.replace(/<[^>]+>/g, " "),
  });
}

// ── Password / email-verification helpers ────────────────────────────
// @convex-dev/auth's Password verifiers call these to deliver the OTP
// or verification link. The API contract is:
//   sendVerificationRequest({ identifier, url, token, ... })
// where `token` is the one-time code we surface to the user. We send
// HTML + a fallback text body so terminal-based clients still work.

export async function sendPasswordResetEmail(args: {
  email: string;
  token: string;
}): Promise<{ ok: boolean; stubbed: boolean }> {
  const subject = "Reset your Runwae password";
  const html = `
    <p style="font-family:system-ui,sans-serif">Use the code below to reset your password.</p>
    <p style="font-family:system-ui,sans-serif;font-size:24px;letter-spacing:4px;font-weight:700;background:#f6f3f0;padding:16px;border-radius:12px;text-align:center">${args.token}</p>
    <p style="font-family:system-ui,sans-serif;color:#666;font-size:13px">The code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
  `;
  const text = `Your Runwae password reset code: ${args.token}\n\nThe code expires in 15 minutes. If you didn't request this, you can ignore this email.`;
  return await sendViaResend({ to: args.email, subject, html, text });
}

export async function sendEmailVerification(args: {
  email: string;
  token: string;
}): Promise<{ ok: boolean; stubbed: boolean }> {
  const subject = "Verify your Runwae email";
  const html = `
    <p style="font-family:system-ui,sans-serif">Welcome to Runwae! Use the code below to verify your email.</p>
    <p style="font-family:system-ui,sans-serif;font-size:24px;letter-spacing:4px;font-weight:700;background:#f6f3f0;padding:16px;border-radius:12px;text-align:center">${args.token}</p>
    <p style="font-family:system-ui,sans-serif;color:#666;font-size:13px">The code expires in 15 minutes.</p>
  `;
  const text = `Your Runwae verification code: ${args.token}\n\nThe code expires in 15 minutes.`;
  return await sendViaResend({ to: args.email, subject, html, text });
}
