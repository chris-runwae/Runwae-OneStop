// Lightweight email helper. Resend isn't wired in this branch, so the helper
// stubs the call when RESEND_API_KEY is absent and logs the intended payload
// instead. Mutations must never fail because dev doesn't have email config.
//
// When Resend is added: import { Resend } from "resend", construct it inside
// the helper, and replace the console.info branch with the actual send. The
// call sites don't need to change.

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
  payload: EventStatusEmailPayload
): Promise<{ ok: boolean; stubbed: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[email:stub] sendEventStatusEmail", payload);
    return { ok: true, stubbed: true };
  }
  // Real send path intentionally not implemented in this branch — wire it
  // up alongside the dependency in a follow-up.
  console.info("[email:wired-but-unimplemented]", payload);
  return { ok: true, stubbed: true };
}
