// Map a Discover/Saved/Detail item to the in-app booking flow when one exists.
// Hotel cards (LiteAPI) → /hotels/{apiRef}; Flight cards (Duffel) → /flights/{apiRef}.
// Other categories return null so callers can fall back to externalUrl or a
// read-only detail page.

export type BookingHrefInput = {
  provider: string;
  apiRef: string;
  category: string;
};

export function bookingHrefFor(
  item: BookingHrefInput,
  opts: { checkin?: string; checkout?: string; adults?: number } = {},
): string | null {
  const cat = item.category.toLowerCase();
  const provider = item.provider.toLowerCase();

  // Static fallback samples have no real provider apiRef to book against —
  // surface them but don't claim to take the user to a checkout flow.
  if (provider === "static") return null;

  if (cat === "stay" || cat === "hotel" || provider === "liteapi") {
    const params = new URLSearchParams();
    if (opts.checkin) params.set("checkin", opts.checkin);
    if (opts.checkout) params.set("checkout", opts.checkout);
    if (opts.adults !== undefined) params.set("adults", String(opts.adults));
    const qs = params.toString();
    return `/hotels/${encodeURIComponent(item.apiRef)}${qs ? `?${qs}` : ""}`;
  }
  if (cat === "fly" || cat === "flight" || provider === "duffel") {
    return `/flights/${encodeURIComponent(item.apiRef)}`;
  }
  return null;
}
