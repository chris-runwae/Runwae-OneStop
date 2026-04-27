import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { DiscoveryDetail, DiscoveryItem } from "./types";

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
        const rates = await fetchRates(apiKey, items.map((i) => i.apiRef), checkin, checkout);
        for (const it of items) {
          const r = rates[it.apiRef];
          if (r) {
            it.price = r.price ?? it.price;
            it.currency = r.currency ?? it.currency;
          }
        }
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
        description: h.description ?? h.hotelDescription,
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
  roomName: string;
  boardName?: string;
  refundable: boolean;
  cancellationPolicies?: string;
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
      if (!res.ok) return [];
      const json = (await res.json()) as { data?: any[] };
      const hotel = json.data?.[0];
      if (!hotel) return [];
      const nights = Math.max(
        1,
        Math.round(
          (Date.parse(checkout) - Date.parse(checkin)) / 86_400_000,
        ),
      );
      const out: LiteApiRate[] = [];
      for (const room of hotel.roomTypes ?? []) {
        for (const rate of room.rates ?? []) {
          const total =
            rate.retailRate?.total?.[0]?.amount ?? rate.minPrice ?? rate.price;
          if (total === undefined) continue;
          const currency =
            rate.retailRate?.total?.[0]?.currency ?? rate.currency ?? "GBP";
          out.push({
            rateId: String(rate.rateId ?? rate.id ?? ""),
            roomName: room.roomTypeName ?? room.name ?? "Room",
            boardName: rate.boardName ?? rate.boardType,
            refundable: !!(rate.cancellationPolicies?.refundableTag === "RFN" || rate.refundable),
            cancellationPolicies:
              rate.cancellationPolicies?.cancelPolicyInfos?.[0]?.cancelTime,
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
  args: { rateId: v.string() },
  handler: async (
    _ctx,
    { rateId },
  ): Promise<{
    prebookId: string;
    finalPrice: number;
    currency: string;
  } | null> => {
    const apiKey = process.env.LITEAPI_KEY;
    if (!apiKey) return null;
    try {
      const res = await fetch("https://api.liteapi.travel/v3.0/rates/prebook", {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rateId, voucherCode: undefined }),
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { data?: any };
      const data = json.data;
      if (!data?.prebookId) return null;
      return {
        prebookId: String(data.prebookId),
        finalPrice: Number(data.price ?? 0),
        currency: String(data.currency ?? "GBP"),
      };
    } catch (err) {
      console.error("[liteapi] prebook failed", err);
      return null;
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

async function fetchRates(
  apiKey: string,
  hotelIds: string[],
  checkin: string,
  checkout: string,
): Promise<Record<string, { price?: number; currency?: string }>> {
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
    const out: Record<string, { price?: number; currency?: string }> = {};
    for (const row of json.data ?? []) {
      const id = String(row.hotelId ?? row.id ?? "");
      if (!id) continue;
      const offer = row.roomTypes?.[0]?.rates?.[0] ?? row.rates?.[0];
      const price = offer?.retailRate?.total?.[0]?.amount ?? offer?.minPrice ?? offer?.price;
      const currency = offer?.retailRate?.total?.[0]?.currency ?? offer?.currency ?? "GBP";
      if (price !== undefined) out[id] = { price, currency };
    }
    return out;
  } catch (err) {
    console.error("[liteapi] rates fetch failed", err);
    return {};
  }
}
