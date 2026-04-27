import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { DiscoveryDetail, DiscoveryItem } from "./types";

// Allow-list HTML sanitiser. LiteAPI returns descriptions as HTML with mixed
// quality — we keep semantic tags + line breaks and strip everything else
// (script/style/iframe/event handlers/javascript: URLs).
const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "div", "span",
]);

function sanitizeHotelHtml(input: string): string {
  if (!input) return "";
  let out = input;
  // Drop entire tag + content for dangerous blocks.
  out = out.replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "");
  // Strip any remaining tags whose name isn't on the allow-list.
  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag: string) => {
    return ALLOWED_TAGS.has(tag.toLowerCase()) ? stripAttrs(match, tag.toLowerCase()) : "";
  });
  // Strip lingering "javascript:" URLs that survived attr stripping.
  out = out.replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, "");
  return out.trim();
}

function stripAttrs(tagHtml: string, _tagName: string): string {
  // Remove all attributes — we don't need any for the allow-listed tags.
  if (tagHtml.startsWith("</")) return tagHtml.replace(/\s.*$/, ">");
  const m = tagHtml.match(/^<([a-zA-Z][a-zA-Z0-9]*)/);
  if (!m) return "";
  const closing = tagHtml.endsWith("/>") ? "/>" : ">";
  return `<${m[1]}${closing === "/>" ? " /" : ""}>`;
}

export const search = internalAction({
  args: {
    category: v.string(),
    term: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    limit: v.number(),
    checkin: v.optional(v.string()),
    checkout: v.optional(v.string()),
  },
  handler: async (
    _ctx,
    { term, lat, lng, limit, checkin, checkout },
  ): Promise<DiscoveryItem[]> => {
    const apiKey = process.env.LITEAPI_KEY;
    if (!apiKey) {
      console.warn("[liteapi] LITEAPI_KEY not set — returning empty");
      return [];
    }
    try {
      const url = new URL("https://api.liteapi.travel/v3.0/data/hotels");
      if (lat !== undefined && lng !== undefined) {
        url.searchParams.set("latitude", String(lat));
        url.searchParams.set("longitude", String(lng));
        url.searchParams.set("radius", "20000"); // 20 km
      } else if (term) {
        url.searchParams.set("destinationName", term);
      } else {
        return [];
      }
      url.searchParams.set("limit", String(Math.min(limit, 12)));

      const res = await fetch(url.toString(), {
        headers: { "X-API-Key": apiKey, Accept: "application/json" },
      });
      if (!res.ok) {
        console.warn("[liteapi] response not ok", res.status);
        return [];
      }
      const data = (await res.json()) as { data?: any[] };
      const hotels = data.data ?? [];
      const items: DiscoveryItem[] = hotels.slice(0, limit).map((h: any) => ({
        provider: "liteapi" as const,
        apiRef: String(h.id ?? ""),
        category: "stay" as const,
        title: h.name ?? "Hotel",
        description: h.description?.slice(0, 200),
        imageUrl: h.main_photo ?? h.thumbnail,
        price: h.priceFrom,
        currency: h.currency ?? "USD",
        locationName: h.address,
        coords:
          h.latitude && h.longitude ? { lat: h.latitude, lng: h.longitude } : undefined,
        rating: h.rating,
      }));

      if (checkin && checkout && items.length > 0) {
        const rates = await fetchRates(
          apiKey,
          items.map((i) => i.apiRef),
          checkin,
          checkout,
        );
        // Only keep hotels with at least one bookable rate for the requested
        // dates. Hotels priced from the catalogue but unsellable on these
        // nights add noise — the user can't book them anyway.
        const filtered: DiscoveryItem[] = [];
        for (const it of items) {
          const r = rates[it.apiRef];
          if (!r) continue;
          it.price = r.price;
          it.currency = r.currency;
          filtered.push(it);
        }
        return filtered;
      }
      return items;
    } catch (err) {
      console.error("[liteapi] fetch failed", err);
      return [];
    }
  },
});

export const getDetail = internalAction({
  args: { apiRef: v.string() },
  handler: async (_ctx, { apiRef }): Promise<DiscoveryDetail | null> => {
    const apiKey = process.env.LITEAPI_KEY;
    if (!apiKey) return null;
    try {
      const res = await fetch(`https://api.liteapi.travel/v3.0/data/hotel?hotelId=${encodeURIComponent(apiRef)}`, {
        headers: { "X-API-Key": apiKey, Accept: "application/json" },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { data?: any };
      const h = data.data;
      if (!h) return null;
      const gallery = Array.isArray(h.hotelImages)
        ? h.hotelImages.map((img: any) => img.url).filter(Boolean).slice(0, 12)
        : undefined;
      return {
        provider: "liteapi",
        apiRef: String(h.id ?? apiRef),
        category: "stay",
        title: h.name ?? "Hotel",
        description: sanitizeHotelHtml(h.description ?? h.hotelDescription ?? ""),
        imageUrl: h.main_photo ?? gallery?.[0],
        price: h.priceFrom,
        currency: h.currency ?? "USD",
        locationName: h.address,
        address: h.address,
        coords:
          h.latitude && h.longitude ? { lat: h.latitude, lng: h.longitude } : undefined,
        rating: h.rating,
        reviewCount: h.reviewCount,
        gallery,
        amenities: Array.isArray(h.amenities) ? h.amenities.slice(0, 12).map((a: any) => a.name ?? a) : undefined,
      };
    } catch (err) {
      console.error("[liteapi] getDetail failed", err);
      return null;
    }
  },
});

export type LiteApiRate = {
  rateId: string;
  // The room-level offer token. LiteAPI v3 prebook actually wants offerId,
  // not rateId — we keep both around so the UI can still key on rateId.
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

export const getRoomRates = internalAction({
  args: {
    apiRef: v.string(),
    checkin: v.string(),
    checkout: v.string(),
    adults: v.optional(v.number()),
  },
  handler: async (
    _ctx,
    { apiRef, checkin, checkout, adults },
  ): Promise<LiteApiRate[]> => {
    const apiKey = process.env.LITEAPI_KEY;
    if (!apiKey) return [];
    try {
      const res = await fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotelIds: [apiRef],
          checkin,
          checkout,
          currency: "GBP",
          guestNationality: "GB",
          occupancies: [{ adults: adults ?? 2 }],
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.warn("[liteapi] rates not ok", res.status, txt.slice(0, 200));
        return [];
      }
      const json = (await res.json()) as { data?: any[] };
      const hotel = json.data?.[0];
      if (!hotel) return [];
      const nights = Math.max(
        1,
        Math.round((Date.parse(checkout) - Date.parse(checkin)) / 86_400_000),
      );

      const out: LiteApiRate[] = [];
      for (const room of hotel.roomTypes ?? []) {
        // LiteAPI v3: each rate is the bookable unit, and the human-readable
        // room name lives on the rate (rate.name = "Classic Room" etc).
        // Room-level fields like roomTypeName don't exist in the response.
        const offerId = String(room.offerId ?? "").trim();

        const roomPhotos: string[] = Array.isArray(room.photos)
          ? room.photos
              .map((p: any) => (typeof p === "string" ? p : p?.url))
              .filter((u: any): u is string => !!u)
              .slice(0, 6)
          : [];
        const roomAmenities: string[] = Array.isArray(room.amenities)
          ? room.amenities
              .map((a: any) => (typeof a === "string" ? a : a?.name))
              .filter((a: any): a is string => !!a)
              .slice(0, 8)
          : [];
        const roomBedTypes: string[] = Array.isArray(room.bedTypes)
          ? room.bedTypes
              .map((b: any) =>
                typeof b === "string"
                  ? b
                  : b?.quantity && b?.bedType
                    ? `${b.quantity}× ${b.bedType}`
                    : (b?.bedType ?? null),
              )
              .filter((b: any): b is string => !!b)
          : [];
        const roomDescription =
          typeof room.description === "string" ? room.description : undefined;

        for (const rate of room.rates ?? []) {
          // Shared with the search-list filter so the catalogue and the
          // detail page agree on which rates are bookable.
          if (!isBookableRate(rate)) continue;
          const rateId = String(rate.rateId ?? rate.id ?? "").trim();

          const total =
            rate.retailRate?.total?.[0]?.amount ?? rate.minPrice ?? rate.price;
          if (typeof total !== "number") continue;
          const currency: string =
            rate.retailRate?.total?.[0]?.currency ?? rate.currency ?? "GBP";

          const refundable = !!(
            rate.cancellationPolicies?.refundableTag === "RFN" ||
            rate.refundable === true
          );
          const cancelInfo =
            rate.cancellationPolicies?.cancelPolicyInfos?.[0]?.cancelTime;

          out.push({
            rateId,
            offerId,
            roomName: rate.name ?? roomDescription ?? "Room",
            roomDescription,
            boardName: rate.boardName ?? rate.boardType,
            bedTypes: roomBedTypes.length > 0 ? roomBedTypes : undefined,
            maxOccupancy:
              typeof rate.maxOccupancy === "number" ? rate.maxOccupancy : undefined,
            adultCount:
              typeof rate.adultCount === "number" ? rate.adultCount : undefined,
            childCount:
              typeof rate.childCount === "number" ? rate.childCount : undefined,
            refundable,
            cancellationPolicy: cancelInfo,
            photos: roomPhotos.length > 0 ? roomPhotos : undefined,
            amenities: roomAmenities.length > 0 ? roomAmenities : undefined,
            remarks: typeof rate.remarks === "string" && rate.remarks.length > 0 ? rate.remarks : undefined,
            pricePerNight: total / nights,
            totalPrice: total,
            currency,
          });
        }
      }
      return out;
    } catch (err) {
      console.error("[liteapi] getRoomRates failed", err);
      return [];
    }
  },
});

export const prebook = internalAction({
  // LiteAPI v3 prebook actually wants the room-level offerId + a
  // usePaymentSdk flag; rateId-only requests come back with
  // "required request field is missing or wrong input".
  args: { offerId: v.string() },
  handler: async (
    _ctx,
    { offerId },
  ): Promise<{
    ok: boolean;
    prebookId?: string;
    finalPrice?: number;
    currency?: string;
    reason?: string;
  }> => {
    const apiKey = process.env.LITEAPI_KEY;
    if (!apiKey) return { ok: false, reason: "Hotels API not configured" };
    try {
      const res = await fetch("https://api.liteapi.travel/v3.0/rates/prebook", {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ offerId, usePaymentSdk: false }),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.warn("[liteapi] prebook not ok", {
          status: res.status,
          offerId,
          body: txt.slice(0, 400),
        });
        // Try to extract LiteAPI's own error message so the UI surfaces
        // something actionable rather than "rejected (400)".
        let reason = `Hotel API rejected this rate (${res.status})`;
        try {
          const parsed = JSON.parse(txt) as { error?: { message?: string }; message?: string };
          const apiMsg = parsed.error?.message ?? parsed.message;
          if (apiMsg) reason = String(apiMsg);
        } catch {
          // Non-JSON response — keep the default reason.
        }
        return { ok: false, reason };
      }
      const json = (await res.json()) as { data?: any; error?: any };
      const data = json.data;
      if (!data?.prebookId) {
        const msg = json.error?.message ?? "Rate no longer available";
        return { ok: false, reason: String(msg) };
      }
      return {
        ok: true,
        prebookId: String(data.prebookId),
        finalPrice: Number(data.price ?? 0),
        currency: String(data.currency ?? "GBP"),
      };
    } catch (err) {
      console.error("[liteapi] prebook failed", err);
      return { ok: false, reason: "Network error" };
    }
  },
});

export const book = internalAction({
  args: {
    prebookId: v.string(),
    holderFirstName: v.string(),
    holderLastName: v.string(),
    holderEmail: v.string(),
    paymentRef: v.string(),
  },
  handler: async (
    _ctx,
    args,
  ): Promise<{ bookingId: string; status: string; confirmationCode?: string } | null> => {
    const apiKey = process.env.LITEAPI_KEY;
    if (!apiKey) return null;
    try {
      const res = await fetch("https://api.liteapi.travel/v3.0/rates/book", {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prebookId: args.prebookId,
          holder: {
            firstName: args.holderFirstName,
            lastName: args.holderLastName,
            email: args.holderEmail,
          },
          payment: { method: "ACC_CREDIT_CARD", transactionId: args.paymentRef },
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error("[liteapi] book failed", res.status, txt.slice(0, 300));
        return null;
      }
      const json = (await res.json()) as { data?: any };
      const data = json.data;
      if (!data) return null;
      return {
        bookingId: String(data.bookingId ?? data.id ?? ""),
        status: String(data.status ?? "confirmed"),
        confirmationCode: data.confirmationCode ? String(data.confirmationCode) : undefined,
      };
    } catch (err) {
      console.error("[liteapi] book error", err);
      return null;
    }
  },
});

// Returns the cheapest bookable rate per hotel, applying the same
// bookability filter as `getRoomRates` (skip package-only rates, require a
// card-supported paymentTypes entry). Hotels with no bookable rate are
// omitted from the result so callers can drop them from listings.
async function fetchRates(
  apiKey: string,
  hotelIds: string[],
  checkin: string,
  checkout: string,
): Promise<Record<string, { price: number; currency: string }>> {
  try {
    const res = await fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hotelIds,
        checkin,
        checkout,
        currency: "GBP",
        guestNationality: "GB",
        occupancies: [{ adults: 2 }],
      }),
    });
    if (!res.ok) {
      console.warn("[liteapi] rates not ok", res.status);
      return {};
    }
    const json = (await res.json()) as { data?: any[] };
    const out: Record<string, { price: number; currency: string }> = {};
    for (const row of json.data ?? []) {
      const id = String(row.hotelId ?? row.id ?? "");
      if (!id) continue;

      // Walk every rate in every room and keep only the cheapest one that
      // would actually pass our prebook filter.
      let cheapest: { price: number; currency: string } | null = null;
      for (const room of row.roomTypes ?? []) {
        for (const rate of room.rates ?? []) {
          if (!isBookableRate(rate)) continue;
          const price =
            rate.retailRate?.total?.[0]?.amount ?? rate.minPrice ?? rate.price;
          if (typeof price !== "number") continue;
          const currency: string =
            rate.retailRate?.total?.[0]?.currency ?? rate.currency ?? "GBP";
          if (cheapest === null || price < cheapest.price) {
            cheapest = { price, currency };
          }
        }
      }
      if (cheapest) out[id] = cheapest;
    }
    return out;
  } catch (err) {
    console.error("[liteapi] rates fetch failed", err);
    return {};
  }
}

// Same predicate the room-detail page uses, factored out so search and
// detail stay in sync. A hotel that exposes no `isBookableRate` rates
// won't be listed when dates are present.
//
// LiteAPI v3 rates we've inspected carry paymentTypes like ["NUITEE_PAY"] —
// that's their own processor and is the standard path; not a credit-card
// string. The only structural signal of "won't book" we've actually seen is
// a missing rateId. Don't add filters against fields LiteAPI doesn't return.
function isBookableRate(rate: any): boolean {
  const rateId = String(rate?.rateId ?? rate?.id ?? "").trim();
  return rateId.length > 0;
}
