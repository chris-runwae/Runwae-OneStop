// LiteAPI rates carry session-bound rateId and offerId tokens that change on
// every /hotels/rates call. The hotel detail page lists rates and links to the
// room detail page, but a refetch on the room page never matches the rateId
// from the previous fetch. Stash the chosen rate in sessionStorage during the
// click handler so the room page can render it without refetching.
//
// Keep this on the client side only — sessionStorage is cleared on tab close,
// which is fine because LiteAPI rates also expire within minutes anyway.

export type CachedRate = {
  rateId: string;
  offerId: string;
  roomName: string;
  roomDescription?: string;
  boardName?: string;
  bedTypes?: string[];
  maxOccupancy?: number;
  adultCount?: number;
  childCount?: number;
  refundable: boolean;
  cancellationPolicy?: string;
  photos?: string[];
  amenities?: string[];
  remarks?: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
};

type Envelope = {
  rate: CachedRate;
  cachedAt: number;
};

// 25 min — a touch under LiteAPI's typical 30-min prebook window.
const TTL_MS = 25 * 60 * 1000;

function key(
  apiRef: string,
  checkin: string,
  checkout: string,
  adults: number,
  rateId: string,
): string {
  return `runwae:room-rate:${apiRef}:${checkin}:${checkout}:${adults}:${rateId}`;
}

export function stashRoomRate(
  apiRef: string,
  checkin: string,
  checkout: string,
  adults: number,
  rateId: string,
  rate: CachedRate,
): void {
  if (typeof window === "undefined") return;
  try {
    const env: Envelope = { rate, cachedAt: Date.now() };
    window.sessionStorage.setItem(
      key(apiRef, checkin, checkout, adults, rateId),
      JSON.stringify(env),
    );
  } catch {
    // SessionStorage may be unavailable (private mode, quota). The room page
    // will fall back to refetching and matching by stable fields.
  }
}

export function readRoomRate(
  apiRef: string,
  checkin: string,
  checkout: string,
  adults: number,
  rateId: string,
): CachedRate | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(
      key(apiRef, checkin, checkout, adults, rateId),
    );
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope;
    if (Date.now() - env.cachedAt > TTL_MS) return null;
    return env.rate;
  } catch {
    return null;
  }
}
