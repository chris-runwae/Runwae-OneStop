// Shared slug helpers. The convention across Runwae is kebab-case +
// 8-char base36 nanoid suffix (e.g. "lisbon-3k4n2j8x"), which keeps
// slugs human-readable and globally unique. trips.ts already inlines
// an equivalent slugify() (TODO: dedupe in a follow-up); destinations
// historically used bare slugs ("lisbon"), so the admin create
// mutation tries the bare kebab first and only appends a suffix on
// collision.

const SUFFIX_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function randomSlugSuffix(length = 8): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SUFFIX_ALPHABET[Math.floor(Math.random() * SUFFIX_ALPHABET.length)];
  }
  return out;
}

export function kebabize(input: string, maxLen = 48): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen);
}

// Append a random suffix. Used when a bare kebab would collide.
export function slugifyWithSuffix(name: string, fallback = "item"): string {
  const base = kebabize(name) || fallback;
  return `${base}-${randomSlugSuffix(8)}`;
}
