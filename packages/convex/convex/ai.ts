import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

// ── Quota ────────────────────────────────────────────────────────────────
// Dev: 10 free AI trips per user. Prod: 3, then a paywall.
const DEV_LIMIT = 10;
const PROD_LIMIT = 3;
function quotaLimit(): number {
  const env = process.env.CONVEX_DEPLOYMENT ?? "";
  return env.startsWith("prod:") ? PROD_LIMIT : DEV_LIMIT;
}

export const getQuota = query({
  args: {},
  handler: async (
    ctx
  ): Promise<{ used: number; limit: number; remaining: number }> => {
    const userId = await getAuthUserId(ctx);
    const limit = quotaLimit();
    if (userId === null) return { used: 0, limit, remaining: limit };
    const user = await ctx.db.get(userId);
    const used = user?.aiTripsUsed ?? 0;
    return { used, limit, remaining: Math.max(0, limit - used) };
  },
});

// One-shot admin refund — call from CLI to credit users who got burned by
// the double-fire bug:
//   npx convex run ai:adminRefundQuota '{"email":"x@y.com","count":10}'
// Identifies the user by email so we don't have to dig out an Id<"users">
// from the dashboard. Caps the resulting `aiTripsUsed` at 0.
export const adminRefundQuota = mutation({
  args: {
    email: v.string(),
    count: v.number(),
  },
  handler: async (ctx, args): Promise<{ refunded: number; newUsed: number }> => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    if (!user) throw new Error(`No user with email ${args.email}`);
    const used = user.aiTripsUsed ?? 0;
    const newUsed = Math.max(0, used - args.count);
    await ctx.db.patch(user._id, { aiTripsUsed: newUsed });
    return { refunded: used - newUsed, newUsed };
  },
});

// ── AI trip request bookkeeping ──────────────────────────────────────────

export const createAiTripRequest = mutation({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    return await ctx.db.insert("ai_trips", {
      userId,
      prompt: args.prompt,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const setAiTripResult = internalMutation({
  args: {
    aiTripId: v.id("ai_trips"),
    result: v.optional(v.string()),
    tripId: v.optional(v.id("trips")),
    status: v.union(v.literal("complete"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.aiTripId, {
      result: args.result,
      tripId: args.tripId,
      status: args.status,
    });
  },
});

export const getMyAiTrips = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("ai_trips")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ── Internal helpers ─────────────────────────────────────────────────────

export const _findExistingByIdempotency = internalQuery({
  args: { aiIdempotencyKey: v.string() },
  handler: async (
    ctx,
    { aiIdempotencyKey }
  ): Promise<{ tripId: Id<"trips">; slug: string } | null> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const trip = await ctx.db
      .query("trips")
      .withIndex("by_ai_key", (q) => q.eq("aiIdempotencyKey", aiIdempotencyKey))
      .first();
    if (!trip) return null;
    if (trip.creatorId !== userId) return null;
    return { tripId: trip._id, slug: trip.slug };
  },
});

export const _checkAndReserveQuota = internalMutation({
  args: {},
  handler: async (
    ctx
  ): Promise<{ ok: true; used: number } | { ok: false; reason: string }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { ok: false, reason: "not_authenticated" };
    const limit = quotaLimit();
    const user = await ctx.db.get(userId);
    const used = user?.aiTripsUsed ?? 0;
    if (used >= limit) return { ok: false, reason: "quota_exhausted" };
    await ctx.db.patch(userId, { aiTripsUsed: used + 1 });
    return { ok: true, used: used + 1 };
  },
});

export const _refundQuota = internalMutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return;
    const user = await ctx.db.get(userId);
    const used = user?.aiTripsUsed ?? 0;
    if (used > 0) await ctx.db.patch(userId, { aiTripsUsed: used - 1 });
  },
});

export const _getEventForPlan = internalQuery({
  args: { eventId: v.id("events") },
  handler: async (
    ctx,
    { eventId }
  ): Promise<{
    event: Doc<"events">;
    destination: Doc<"destinations"> | null;
    viewer: Doc<"users"> | null;
  } | null> => {
    const event = await ctx.db.get(eventId);
    if (!event) return null;
    const destination = event.destinationId
      ? await ctx.db.get(event.destinationId)
      : null;
    const userId = await getAuthUserId(ctx);
    const viewer = userId ? await ctx.db.get(userId) : null;
    return { event, destination, viewer };
  },
});

export const _materializeTripFromAi = internalMutation({
  args: {
    eventId: v.id("events"),
    aiIdempotencyKey: v.optional(v.string()),
    title: v.string(),
    coverImageUrl: v.optional(v.string()),
    visibility: v.optional(
      v.union(
        v.literal("private"),
        v.literal("invite_only"),
        v.literal("friends"),
        v.literal("public")
      )
    ),
    startDate: v.string(),
    endDate: v.string(),
    originLabel: v.string(),
    groupSize: v.union(
      v.literal("solo"),
      v.literal("small"),
      v.literal("large")
    ),
    days: v.array(
      v.object({
        date: v.string(),
        dayNumber: v.number(),
        title: v.optional(v.string()),
        items: v.array(
          v.object({
            type: v.string(),
            title: v.string(),
            startTime: v.optional(v.string()),
            description: v.optional(v.string()),
            locationName: v.optional(v.string()),
            coords: v.optional(
              v.object({ lat: v.number(), lng: v.number() })
            ),
            apiSource: v.optional(v.string()),
            apiRef: v.optional(v.string()),
            price: v.optional(v.number()),
            currency: v.optional(v.string()),
            imageUrl: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args): Promise<{ tripId: Id<"trips">; slug: string }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const ALPHABET =
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijklmnopqrstuvwxyz";
    let suffix = "";
    for (let i = 0; i < 8; i++)
      suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const slugBase = args.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    const slug = `${slugBase || "trip"}-${suffix.slice(0, 8)}`;

    const now = Date.now();
    const tripId = await ctx.db.insert("trips", {
      title: args.title,
      description: `AI-planned trip to ${event.name}.`,
      destinationId: event.destinationId,
      destinationLabel: event.locationName,
      destinationCoords: event.locationCoords,
      creatorId: userId,
      startDate: args.startDate,
      endDate: args.endDate,
      visibility: args.visibility ?? "private",
      status: "planning",
      coverImageUrl:
        args.coverImageUrl ?? event.imageUrl ?? event.imageUrls?.[0],
      slug,
      joinCode: suffix,
      currency: "GBP",
      eventId: args.eventId,
      aiIdempotencyKey: args.aiIdempotencyKey,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("trip_members", {
      tripId,
      userId,
      role: "owner",
      status: "accepted",
      joinedAt: now,
    });

    const VALID_TYPES = new Set([
      "flight",
      "hotel",
      "tour",
      "car_rental",
      "event",
      "restaurant",
      "activity",
      "transport",
      "other",
    ]);

    for (const day of args.days) {
      const dayId = await ctx.db.insert("itinerary_days", {
        tripId,
        date: day.date,
        dayNumber: day.dayNumber,
        title: day.title,
        createdAt: now,
      });
      for (let i = 0; i < day.items.length; i++) {
        const it = day.items[i];
        const safeType = (
          VALID_TYPES.has(it.type) ? it.type : "activity"
        ) as Doc<"itinerary_items">["type"];
        await ctx.db.insert("itinerary_items", {
          tripId,
          dayId,
          addedByUserId: userId,
          type: safeType,
          apiSource: it.apiSource,
          apiRef: it.apiRef,
          title: it.title,
          description: it.description,
          startTime: it.startTime,
          locationName: it.locationName,
          coords: it.coords,
          price: it.price,
          currency: it.currency,
          imageUrl: it.imageUrl,
          isCompleted: false,
          sortOrder: i,
          canBeEditedBy: "editors",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { tripId, slug };
  },
});

// Pre-fetches Viator tours + LiteAPI hotels + Ticketmaster events for the
// destination so we can hand Claude a real candidate set instead of having
// it invent generic items. Wrapped as an internalAction (not inline in the
// public action) so each provider failure can fail independently.
type Candidate = {
  apiRef: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  rating?: number;
  externalUrl?: string;
};

export const _fetchProviderCandidates = internalAction({
  args: {
    destinationName: v.string(),
    coords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    checkin: v.string(),
    checkout: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    tours: Candidate[];
    hotels: Candidate[];
    tickets: Candidate[];
  }> => {
    const [tours, hotels, tickets] = await Promise.all([
      ctx
        .runAction(internal.providers.viator.search, {
          category: "tour",
          term: args.destinationName,
          lat: args.coords?.lat,
          lng: args.coords?.lng,
          limit: 6,
        })
        .catch(() => [] as Candidate[]),
      ctx
        .runAction(internal.providers.liteapi.search, {
          category: "stay",
          term: args.destinationName,
          lat: args.coords?.lat,
          lng: args.coords?.lng,
          limit: 6,
          checkin: args.checkin,
          checkout: args.checkout,
        })
        .catch(() => [] as Candidate[]),
      ctx
        .runAction(internal.providers.ticketmaster.search, {
          category: "event",
          term: args.destinationName,
          lat: args.coords?.lat,
          lng: args.coords?.lng,
          limit: 4,
        })
        .catch(() => [] as Candidate[]),
    ]);

    const map = (items: any[]): Candidate[] =>
      (items ?? []).map((t: any) => ({
        apiRef: t.apiRef,
        title: t.title,
        description: t.description,
        imageUrl: t.imageUrl,
        price: t.price,
        currency: t.currency,
        rating: t.rating,
        externalUrl: t.externalUrl,
      }));

    return {
      tours: map(tours as any[]),
      hotels: map(hotels as any[]),
      tickets: map(tickets as any[]),
    };
  },
});

// Backfill Unsplash photos for AI items that don't have an imageUrl. Runs
// AFTER Claude returns so we don't waste calls on items where Claude (or
// the candidate catalogue) already supplied a real provider image.
export const _unsplashBackfill = internalAction({
  args: {
    queries: v.array(v.string()),
  },
  handler: async (ctx, { queries }): Promise<Record<string, string>> => {
    if (!process.env.UNSPLASH_ACCESS_KEY) return {};
    const out: Record<string, string> = {};
    // Sequential to keep per-hour Unsplash spend small (50 req/hr on demo
    // mode). At a typical 5–8 items per trip this is well inside budget.
    for (const q of queries) {
      if (!q || out[q]) continue;
      try {
        const photos = await ctx.runAction(api.unsplash.searchPhotos, {
          query: q,
          perPage: 1,
          orientation: "landscape",
        });
        if (photos && photos.length > 0) out[q] = photos[0].url;
      } catch (err) {
        console.warn("[ai] unsplash backfill failed for", q, err);
      }
    }
    return out;
  },
});

// ── Public action: plan a trip from an event using Claude ─────────────────

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

type GroupSize = "solo" | "small" | "large";
type AiDay = {
  date: string;
  dayNumber: number;
  title?: string;
  items: Array<{
    type: string;
    title: string;
    startTime?: string;
    description?: string;
    locationName?: string;
    coords?: { lat: number; lng: number };
    apiSource?: string;
    apiRef?: string;
    price?: number;
    currency?: string;
    imageUrl?: string;
  }>;
};

function fallbackDays(args: {
  start: string;
  end: string;
  eventName: string;
  destinationLabel: string;
  eventStartUtc: number;
}): AiDay[] {
  const startMs = Date.parse(args.start);
  const endMs = Date.parse(args.end);
  const out: AiDay[] = [];
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return out;
  const days = Math.max(1, Math.floor((endMs - startMs) / 86400000) + 1);
  const eventDay = new Date(args.eventStartUtc).toISOString().slice(0, 10);
  for (let i = 0; i < days; i++) {
    const date = new Date(startMs + i * 86400000).toISOString().slice(0, 10);
    const isEventDay = date === eventDay;
    out.push({
      date,
      dayNumber: i + 1,
      title: isEventDay
        ? args.eventName
        : i === 0
          ? "Arrival"
          : i === days - 1
            ? "Departure"
            : `Explore ${args.destinationLabel.split(",")[0]}`,
      items: isEventDay
        ? [
            {
              type: "event",
              title: args.eventName,
              startTime: new Date(args.eventStartUtc)
                .toISOString()
                .slice(11, 16),
              locationName: args.destinationLabel,
            },
          ]
        : [],
    });
  }
  return out;
}

async function callClaudeForItinerary(args: {
  apiKey: string;
  event: Doc<"events">;
  origin: string;
  groupSize: GroupSize;
  startDate: string;
  endDate: string;
  travellerTags: string[];
  candidateTours: Array<{ apiRef: string; title: string; price?: number; currency?: string; description?: string }>;
  candidateHotels: Array<{ apiRef: string; title: string; price?: number; currency?: string; description?: string }>;
  candidateTickets: Array<{ apiRef: string; title: string; price?: number; currency?: string; description?: string }>;
}): Promise<AiDay[] | null> {
  const groupCopy =
    args.groupSize === "solo"
      ? "a solo traveller"
      : args.groupSize === "small"
        ? "a small group of 2–4 friends/partners"
        : "a large group of 5+ (think bachelor / birthday / crew)";

  const tagCopy =
    args.travellerTags.length > 0
      ? `The traveller's profile tags are: ${args.travellerTags.join(", ")}. Bias day picks toward these vibes.`
      : "No traveller tags on file — keep picks broadly appealing.";

  const tourCatalog =
    args.candidateTours.length > 0
      ? `\n\nAvailable Viator tours (use \`apiSource: "viator"\` and the matching \`apiRef\` when picking these — DO NOT invent new ones outside this list):\n${args.candidateTours
          .map(
            (t) =>
              `- [viator:${t.apiRef}] ${t.title}${t.price ? ` (${t.currency ?? "GBP"} ${t.price})` : ""}${t.description ? ` — ${t.description.slice(0, 120)}` : ""}`
          )
          .join("\n")}`
      : "";
  const hotelCatalog =
    args.candidateHotels.length > 0
      ? `\n\nAvailable LiteAPI hotels (use \`apiSource: "liteapi"\` + the \`apiRef\` for the chosen hotel; pick exactly ONE for the whole stay):\n${args.candidateHotels
          .map(
            (h) =>
              `- [liteapi:${h.apiRef}] ${h.title}${h.price ? ` (${h.currency ?? "GBP"} ${h.price}/night)` : ""}`
          )
          .join("\n")}`
      : "";
  const ticketCatalog =
    args.candidateTickets.length > 0
      ? `\n\nAvailable Ticketmaster events nearby (use \`apiSource: "ticketmaster"\` + the \`apiRef\` if any of these complement the trip; \`type\` should stay "event"):\n${args.candidateTickets
          .map(
            (t) =>
              `- [ticketmaster:${t.apiRef}] ${t.title}${t.price ? ` (${t.currency ?? "GBP"} ${t.price}+)` : ""}`
          )
          .join("\n")}`
      : "";

  const sysPrompt = `You are a trip planner producing strict JSON itineraries.
Output ONLY a JSON object with shape:
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "dayNumber": 1,
      "title": "Short headline for the day",
      "items": [
        {
          "type": "flight"|"hotel"|"tour"|"event"|"restaurant"|"activity"|"transport"|"other",
          "title": "...",
          "startTime": "HH:MM",
          "description": "Why this fits",
          "locationName": "Place, City",
          "apiSource": "viator"|"liteapi",   // ONLY if picking from the catalogues below
          "apiRef": "...",                    // matching apiRef from the catalogue
          "price": 0,
          "currency": "GBP"
        }
      ]
    }
  ]
}
No markdown, no commentary.`;

  const userPrompt = `Plan a trip for ${groupCopy} from ${args.origin} to ${args.event.locationName} for the event "${args.event.name}".
Trip dates: ${args.startDate} to ${args.endDate}.
Event time: ${new Date(args.event.startDateUtc).toISOString()}.
${tagCopy}

Day-shape rules:
- Day 1: arrival flight + check-in to the chosen hotel.
- Event day: pin the event itself as the headline item at its real start time.
- Other days: 2–4 items mixing tour/restaurant/activity around the destination.
- Final day: departure flight.
- Pick exactly ONE hotel from the LiteAPI catalogue and reuse it across the stay (one hotel item per day for booking simplicity is fine; if you want to omit hotel items on filler days that's also fine).
- Prefer Viator tours from the catalogue over invented activities; keep the rest as natural \`activity\` / \`restaurant\` items without apiSource.
- If a Ticketmaster show on the side complements the trip (e.g. a gig the night after the headline event), include it as one extra \`event\` item.${tourCatalog}${hotelCatalog}${ticketCatalog}`;

  try {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "x-api-key": args.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 3200,
        system: sysPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!res.ok) {
      console.warn("[ai] Claude returned", res.status);
      return null;
    }
    const json = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = json.content?.find((c) => c.type === "text")?.text ?? "";
    const cleaned = text
      .replace(/^```(?:json)?/i, "")
      .replace(/```\s*$/, "")
      .trim();
    const parsed = JSON.parse(cleaned) as { days?: AiDay[] };
    if (!Array.isArray(parsed.days)) return null;
    return parsed.days;
  } catch (err) {
    console.error("[ai] Claude call failed", err);
    return null;
  }
}

export const generateTripFromEvent = action({
  args: {
    eventId: v.id("events"),
    origin: v.string(),
    groupSize: v.union(
      v.literal("solo"),
      v.literal("small"),
      v.literal("large")
    ),
    startDate: v.string(),
    endDate: v.string(),
    // Optional client-minted UUID for dedupe. If omitted, we mint one
    // server-side (idempotency only protects against client double-fires
    // when the client supplies the key, but the server-mint keeps the
    // schema satisfied for older clients without the field).
    idempotencyKey: v.optional(v.string()),
    // New step in the modal: user-chosen title, cover, visibility.
    title: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    visibility: v.optional(
      v.union(
        v.literal("private"),
        v.literal("invite_only"),
        v.literal("friends"),
        v.literal("public")
      )
    ),
  },
  handler: async (
    ctx,
    args
  ): Promise<
    | { ok: true; tripId: Id<"trips">; slug: string; remaining: number; reused?: boolean }
    | { ok: false; reason: "not_authenticated" | "quota_exhausted" | "event_missing" | "ai_failed" }
  > => {
    // Mint a server-side fallback key so older clients that don't yet pass
    // one (mid-deploy stale tabs) don't fail validation. The client should
    // still pass its own to get true cross-call dedupe.
    const idempotencyKey =
      args.idempotencyKey ??
      `ai_srv_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // 0) Idempotency dedupe — return the existing trip if we've already
    //    processed this key for this user. No quota slot consumed.
    const existing = await ctx.runQuery(internal.ai._findExistingByIdempotency, {
      aiIdempotencyKey: idempotencyKey,
    });
    if (existing) {
      const limit = quotaLimit();
      const userId = await getAuthUserId(ctx);
      const used =
        userId === null
          ? 0
          : (await ctx.runQuery(internal.ai.getQuotaInternal, {})).used;
      return {
        ok: true,
        tripId: existing.tripId,
        slug: existing.slug,
        remaining: Math.max(0, limit - used),
        reused: true,
      };
    }

    // 1) Reserve quota.
    const reserved = await ctx.runMutation(internal.ai._checkAndReserveQuota, {});
    if (!reserved.ok) {
      return {
        ok: false,
        reason: reserved.reason as "not_authenticated" | "quota_exhausted",
      };
    }

    try {
      // 2) Fetch event + viewer + provider candidates in parallel.
      const ctxData = await ctx.runQuery(internal.ai._getEventForPlan, {
        eventId: args.eventId,
      });
      if (!ctxData) {
        await ctx.runMutation(internal.ai._refundQuota, {});
        return { ok: false, reason: "event_missing" };
      }

      const candidates = await ctx.runAction(
        internal.ai._fetchProviderCandidates,
        {
          destinationName: ctxData.event.locationName,
          coords: ctxData.event.locationCoords,
          checkin: args.startDate,
          checkout: args.endDate,
        }
      );

      // 3) Generate itinerary.
      const apiKey = process.env.ANTHROPIC_API_KEY;
      let days: AiDay[] | null = null;
      if (apiKey) {
        days = await callClaudeForItinerary({
          apiKey,
          event: ctxData.event,
          origin: args.origin,
          groupSize: args.groupSize,
          startDate: args.startDate,
          endDate: args.endDate,
          travellerTags: ctxData.viewer?.travellerTags ?? [],
          candidateTours: candidates.tours,
          candidateHotels: candidates.hotels,
          candidateTickets: candidates.tickets,
        });
      }
      if (!days || days.length === 0) {
        days = fallbackDays({
          start: args.startDate,
          end: args.endDate,
          eventName: ctxData.event.name,
          destinationLabel: ctxData.event.locationName,
          eventStartUtc: ctxData.event.startDateUtc,
        });
      }

      // 4) Backfill provider details (image URL, price) onto items where
      //    Claude only supplied apiSource + apiRef.
      const tourByRef = new Map(
        candidates.tours.map((t) => [t.apiRef, t])
      );
      const hotelByRef = new Map(
        candidates.hotels.map((h) => [h.apiRef, h])
      );
      const ticketByRef = new Map(
        candidates.tickets.map((t) => [t.apiRef, t])
      );
      for (const d of days) {
        for (const it of d.items) {
          if (it.apiSource === "viator" && it.apiRef) {
            const t = tourByRef.get(it.apiRef);
            if (t) {
              it.imageUrl = it.imageUrl ?? t.imageUrl;
              it.price = it.price ?? t.price;
              it.currency = it.currency ?? t.currency;
            }
          } else if (it.apiSource === "liteapi" && it.apiRef) {
            const h = hotelByRef.get(it.apiRef);
            if (h) {
              it.imageUrl = it.imageUrl ?? h.imageUrl;
              it.price = it.price ?? h.price;
              it.currency = it.currency ?? h.currency;
            }
          } else if (it.apiSource === "ticketmaster" && it.apiRef) {
            const tk = ticketByRef.get(it.apiRef);
            if (tk) {
              it.imageUrl = it.imageUrl ?? tk.imageUrl;
              it.price = it.price ?? tk.price;
              it.currency = it.currency ?? tk.currency;
            }
          }
        }
      }

      // 4b) Unsplash backfill for items still missing an image — usually
      //     restaurant / generic activity items Claude invented. Pulls one
      //     landscape photo per (deduped) query so cards aren't blank.
      const itemsMissingImages: Array<{
        item: AiDay["items"][number];
        query: string;
      }> = [];
      const queries = new Set<string>();
      for (const d of days) {
        for (const it of d.items) {
          if (it.imageUrl) continue;
          const q =
            it.locationName ?? it.title ?? ctxData.event.locationName;
          if (!q) continue;
          itemsMissingImages.push({ item: it, query: q });
          queries.add(q);
        }
      }
      if (queries.size > 0) {
        const photoMap = await ctx.runAction(internal.ai._unsplashBackfill, {
          queries: Array.from(queries),
        });
        for (const { item, query } of itemsMissingImages) {
          if (!item.imageUrl && photoMap[query]) {
            item.imageUrl = photoMap[query];
          }
        }
      }

      // 5) Materialise trip.
      const result = await ctx.runMutation(internal.ai._materializeTripFromAi, {
        eventId: args.eventId,
        aiIdempotencyKey: idempotencyKey,
        title: args.title?.trim() || `Trip to ${ctxData.event.name}`,
        coverImageUrl: args.coverImageUrl,
        visibility: args.visibility,
        startDate: args.startDate,
        endDate: args.endDate,
        originLabel: args.origin,
        groupSize: args.groupSize,
        days,
      });

      const limit = quotaLimit();
      return {
        ok: true,
        tripId: result.tripId,
        slug: result.slug,
        remaining: Math.max(0, limit - reserved.used),
      };
    } catch (err) {
      console.error("[ai] generateTripFromEvent failed", err);
      await ctx.runMutation(internal.ai._refundQuota, {});
      return { ok: false, reason: "ai_failed" };
    }
  },
});

// Convenience for the action's "reused" branch — same shape as getQuota
// but callable from another query/action.
export const getQuotaInternal = internalQuery({
  args: {},
  handler: async (
    ctx
  ): Promise<{ used: number; limit: number; remaining: number }> => {
    const userId = await getAuthUserId(ctx);
    const limit = quotaLimit();
    if (userId === null) return { used: 0, limit, remaining: limit };
    const user = await ctx.db.get(userId);
    const used = user?.aiTripsUsed ?? 0;
    return { used, limit, remaining: Math.max(0, limit - used) };
  },
});

// Old placeholder — kept for any legacy call sites.
export const generateTripPlan = action({
  args: { aiTripId: v.id("ai_trips") },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.ai.setAiTripResult, {
        aiTripId: args.aiTripId,
        result: JSON.stringify({ days: [], note: "Use generateTripFromEvent instead" }),
        status: "complete",
      });
      return { ok: true as const };
    } catch (err) {
      await ctx.runMutation(internal.ai.setAiTripResult, {
        aiTripId: args.aiTripId,
        status: "failed",
      });
      throw err;
    }
  },
});
