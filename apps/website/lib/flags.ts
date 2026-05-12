import { cookies } from "next/headers";

/**
 * Identifier => allowed variant set. Default is the first entry.
 * Middleware writes the picked variant into a cookie of the same name as the
 * key, prefixed with `rw_variant_`.
 */
export const flags = {
  home_hero: ["control", "v1"] as const,
} as const;

export type FlagKey = keyof typeof flags;
export type Variant<K extends FlagKey> = (typeof flags)[K][number];

const COOKIE_PREFIX = "rw_variant_";

export async function variant<K extends FlagKey>(key: K): Promise<Variant<K>> {
  const store = await cookies();
  const value = store.get(`${COOKIE_PREFIX}${key}`)?.value;
  const allowed = flags[key] as readonly string[];
  if (value && allowed.includes(value)) return value as Variant<K>;
  return allowed[0] as Variant<K>;
}
