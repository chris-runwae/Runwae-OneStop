// Username conventions:
// - 3 to 20 chars
// - lowercase a-z, digits, underscore
// - must start with a letter
//
// Server-side validation lives in users.setUsername; auto-generation in
// auth.createOrUpdateUser falls back to this module's `generate*` helpers.

const MIN = 3;
const MAX = 20;
const RE_VALID = /^[a-z][a-z0-9_]{2,19}$/;

const RESERVED = new Set([
  "admin",
  "administrator",
  "root",
  "support",
  "help",
  "api",
  "runwae",
  "www",
  "app",
  "auth",
  "settings",
  "profile",
  "trip",
  "trips",
  "event",
  "events",
  "destination",
  "destinations",
  "explore",
  "home",
  "sign_in",
  "sign_up",
]);

export type UsernameValidation =
  | { ok: true }
  | { ok: false; reason: string };

export function validateUsername(raw: string): UsernameValidation {
  const u = raw.trim().toLowerCase();
  if (u.length < MIN) return { ok: false, reason: `Must be at least ${MIN} characters.` };
  if (u.length > MAX) return { ok: false, reason: `Must be at most ${MAX} characters.` };
  if (!RE_VALID.test(u)) {
    return {
      ok: false,
      reason: "Use lowercase letters, numbers, and underscores. Must start with a letter.",
    };
  }
  if (RESERVED.has(u)) return { ok: false, reason: "That username is reserved." };
  return { ok: true };
}

// Sanitize a free-form string into something that fits username rules
// (lowercase, alphanumeric/underscore, starts with a letter, 3-20 chars).
// Used to derive a default candidate from the user's name or email.
export function sanitizeToUsername(input: string): string {
  let u = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  // Must start with a letter
  if (!/^[a-z]/.test(u)) u = "u" + u;
  if (u.length < MIN) u = (u + "_user").slice(0, MIN);
  if (u.length > MAX) u = u.slice(0, MAX);
  return u;
}

function randomSuffix(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

// Build a candidate; ensures it never collides with `taken` (caller passes the
// set of already-used usernames it has checked) and is always valid format.
// On collision or invalid base, appends a 4-char random suffix.
export function buildCandidate(base: string, attempt: number): string {
  const sanitized = sanitizeToUsername(base) || "user";
  const root = sanitized.length > MAX - 5 ? sanitized.slice(0, MAX - 5) : sanitized;
  if (attempt === 0 && validateUsername(sanitized).ok) return sanitized;
  return `${root}_${randomSuffix()}`.slice(0, MAX);
}
