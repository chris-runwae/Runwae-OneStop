import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, internalMutation, type MutationCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { pickDefaultCover } from "./lib/coverImage";

// Shared cascade: deletes a trip and every dependent row across all child
// tables. Called by the user-facing `deleteTrip` mutation AND by the
// account-deletion cascade when a deleted user owned a solo trip. Skips
// permission checks — callers are responsible for enforcing them.
//
// Sweeps deeper than just `by_trip`-indexed tables: also walks through
// expenses → expense_splits, polls → options → votes, and checklists →
// items so we don't leak orphaned rows.
export async function cascadeDeleteTripInternal(
  ctx: MutationCtx,
  tripId: Id<"trips">
): Promise<void> {
  // Polls + their options + votes (deepest nested first).
  const polls = await ctx.db
    .query("trip_polls")
    .withIndex("by_trip", (q) => q.eq("tripId", tripId))
    .collect();
  for (const poll of polls) {
    const options = await ctx.db
      .query("poll_options")
      .withIndex("by_poll", (q) => q.eq("pollId", poll._id))
      .collect();
    for (const option of options) await ctx.db.delete(option._id);
    const votes = await ctx.db
      .query("poll_votes")
      .withIndex("by_poll", (q) => q.eq("pollId", poll._id))
      .collect();
    for (const vote of votes) await ctx.db.delete(vote._id);
    await ctx.db.delete(poll._id);
  }

  // Checklists + their items.
  const checklists = await ctx.db
    .query("trip_checklists")
    .withIndex("by_trip", (q) => q.eq("tripId", tripId))
    .collect();
  for (const checklist of checklists) {
    const items = await ctx.db
      .query("checklist_items")
      .withIndex("by_checklist", (q) => q.eq("checklistId", checklist._id))
      .collect();
    for (const item of items) await ctx.db.delete(item._id);
    await ctx.db.delete(checklist._id);
  }

  // Expenses + their splits.
  const expenses = await ctx.db
    .query("expenses")
    .withIndex("by_trip", (q) => q.eq("tripId", tripId))
    .collect();
  for (const expense of expenses) {
    const splits = await ctx.db
      .query("expense_splits")
      .withIndex("by_expense", (q) => q.eq("expenseId", expense._id))
      .collect();
    for (const split of splits) await ctx.db.delete(split._id);
    await ctx.db.delete(expense._id);
  }

  // Trip-scoped tables indexed directly by_trip.
  const tripScopedTables = [
    "itinerary_items",
    "itinerary_days",
    "saved_items",
    "saved_item_comments",
    "trip_posts",
    "trip_members",
  ] as const;
  for (const table of tripScopedTables) {
    const rows = await ctx.db
      .query(table)
      .withIndex("by_trip", (q: any) => q.eq("tripId", tripId))
      .collect();
    for (const row of rows) await ctx.db.delete(row._id);
  }

  await ctx.db.delete(tripId);
}

const SLUG_SUFFIX_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomId(alphabet: string, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "trip"}-${randomId(SLUG_SUFFIX_ALPHABET, 8)}`;
}

const TRIP_VISIBILITY = v.union(
  v.literal("private"),
  v.literal("invite_only"),
  v.literal("friends"),
  v.literal("public")
);

const TRIP_CATEGORY = v.union(
  v.literal("leisure"),
  v.literal("business"),
  v.literal("family"),
  v.literal("adventure"),
  v.literal("cultural"),
  v.literal("romantic")
);

async function assertTripAccess(
  ctx: { db: any; auth: any },
  tripId: Id<"trips">
): Promise<{ userId: Id<"users">; trip: Doc<"trips">; role: "owner" | "editor" | "viewer" | null }> {
  const userId = await getAuthUserId(ctx as any);
  if (userId === null) throw new Error("Not authenticated");

  const trip = await ctx.db.get(tripId);
  if (!trip) throw new Error("Trip not found");

  const membership = await ctx.db
    .query("trip_members")
    .withIndex("by_trip", (q: any) => q.eq("tripId", tripId))
    .filter((q: any) => q.eq(q.field("userId"), userId))
    .first();

  if (trip.visibility === "public") {
    return { userId, trip, role: membership?.role ?? null };
  }
  if (!membership) throw new Error("Not a member of this trip");
  return { userId, trip, role: membership.role };
}

export const createTrip = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    destinationId: v.optional(v.id("destinations")),
    destinationLabel: v.optional(v.string()),
    destinationCoords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    startDate: v.string(),
    endDate: v.string(),
    category: v.optional(TRIP_CATEGORY),
    visibility: TRIP_VISIBILITY,
    currency: v.string(),
    estimatedBudget: v.optional(v.number()),
    coverImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const startMs = Date.parse(args.startDate);
    const endMs = Date.parse(args.endDate);
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD.");
    }
    if (endMs < startMs) {
      throw new Error("End date cannot be before start date.");
    }

    const now = Date.now();
    const slug = slugify(args.title);
    const joinCode = randomId(JOIN_CODE_ALPHABET, 8);
    const finalCover = args.coverImageUrl ?? pickDefaultCover(slug);

    const tripId = await ctx.db.insert("trips", {
      title: args.title,
      description: args.description,
      destinationId: args.destinationId,
      destinationLabel: args.destinationLabel,
      destinationCoords: args.destinationCoords,
      creatorId: userId,
      startDate: args.startDate,
      endDate: args.endDate,
      category: args.category,
      visibility: args.visibility,
      status: "planning",
      coverImageUrl: finalCover,
      slug,
      joinCode,
      estimatedBudget: args.estimatedBudget,
      currency: args.currency,
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

    // Seed itinerary days from the trip date range so the itinerary tab
    // is never empty on first open. One day per calendar day, inclusive.
    // If the parsed range is degenerate, fall back to a single day.
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const span = Math.floor((endMs - startMs) / MS_PER_DAY) + 1;
    const dayCount = Number.isFinite(span) && span > 0 ? span : 1;
    for (let i = 0; i < dayCount; i++) {
      const iso = new Date(startMs + i * MS_PER_DAY)
        .toISOString()
        .slice(0, 10);
      await ctx.db.insert("itinerary_days", {
        tripId,
        date: iso,
        dayNumber: i + 1,
        createdAt: now,
      });
    }

    return { tripId, slug };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const trip = await ctx.db
      .query("trips")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!trip) return null;

    if (trip.visibility === "public") return trip;

    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    // Surface the trip for both accepted members AND pending invitees so the
    // detail page can render the accept/decline banner. Non-invitees still
    // see null.
    const membership = await ctx.db
      .query("trip_members")
      .withIndex("by_trip", (q) => q.eq("tripId", trip._id))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return membership ? trip : null;
  },
});

// ID-based lookup for clients (mobile) that route on the trip's `_id` rather
// than its slug. Mirrors `getBySlug`'s access rules: public trips are
// returned unconditionally; non-public trips only resolve for accepted or
// pending members.
export const getTripById = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return null;

    if (trip.visibility === "public") return trip;

    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const membership = await ctx.db
      .query("trip_members")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return membership ? trip : null;
  },
});

// Public-facing preview for the join-code landing page. Returns just the
// fields the recipient needs to recognise the trip before joining; member
// count is denormalised so we don't ship the full member list.
export const getInvitePreview = query({
  args: { joinCode: v.string() },
  handler: async (ctx, args) => {
    const trip = await ctx.db
      .query("trips")
      .withIndex("by_join_code", (q) => q.eq("joinCode", args.joinCode))
      .unique();
    if (!trip) return null;

    const members = await ctx.db
      .query("trip_members")
      .withIndex("by_trip", (q) => q.eq("tripId", trip._id))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    return {
      _id: trip._id,
      title: trip.title,
      slug: trip.slug,
      coverImageUrl: trip.coverImageUrl,
      destinationLabel: trip.destinationLabel,
      startDate: trip.startDate,
      endDate: trip.endDate,
      memberCount: members.length,
    };
  },
});

// Lightweight viewer membership lookup for the trip detail page so it can
// render an accept/decline banner when status === "pending".
export const getViewerMembership = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const membership = await ctx.db
      .query("trip_members")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    return membership;
  },
});

/**
 * Public trips for the Explore feed. Returns the most recent
 * `visibility: "public"` trips, excluding any the caller is already a
 * member of. Capped at 50 by default to keep the response bounded.
 */
export const listPublic = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<Doc<"trips">[]> => {
    const limit = Math.min(args.limit ?? 50, 100);

    // Convex doesn't support a compound index by_visibility yet, so we
    // take a bounded slice and filter in memory. The cap keeps the read
    // amplification predictable; a future index on visibility can drop
    // this to a single index scan.
    const recent = await ctx.db.query("trips").order("desc").take(500);
    const publics = recent.filter((t) => t.visibility === "public");

    const userId = await getAuthUserId(ctx);
    let excludedTripIds = new Set<string>();
    if (userId !== null) {
      const myMemberships = await ctx.db
        .query("trip_members")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      excludedTripIds = new Set(
        myMemberships.map((m) => m.tripId as unknown as string),
      );
    }

    return publics
      .filter((t) => !excludedTripIds.has(t._id as unknown as string))
      .slice(0, limit);
  },
});

export const getMyTrips = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const memberships = await ctx.db
      .query("trip_members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const trips = await Promise.all(
      memberships.map((m) => ctx.db.get(m.tripId))
    );
    return trips.filter((t): t is Doc<"trips"> => t !== null);
  },
});

export const updateTrip = mutation({
  args: {
    tripId: v.id("trips"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    destinationId: v.optional(v.id("destinations")),
    destinationLabel: v.optional(v.string()),
    destinationCoords: v.optional(
      v.object({ lat: v.number(), lng: v.number() })
    ),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    category: v.optional(TRIP_CATEGORY),
    visibility: v.optional(TRIP_VISIBILITY),
    status: v.optional(
      v.union(
        v.literal("planning"),
        v.literal("upcoming"),
        v.literal("ongoing"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    coverImageUrl: v.optional(v.string()),
    estimatedBudget: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { role, trip } = await assertTripAccess(ctx, args.tripId);
    if (role !== "owner" && role !== "editor") {
      throw new Error("Not authorized to edit this trip");
    }

    // If location or dates changed, expire any cached discovery payloads
    // keyed against the OLD term so the next Discover search refetches.
    const locationChanged =
      args.destinationLabel !== undefined &&
      args.destinationLabel !== trip.destinationLabel;
    const datesChanged =
      (args.startDate !== undefined && args.startDate !== trip.startDate) ||
      (args.endDate !== undefined && args.endDate !== trip.endDate);
    if (locationChanged || datesChanged) {
      const oldTerm = trip.destinationLabel?.split(",")[0]?.trim().toLowerCase();
      if (oldTerm) {
        // Bounded sweep — same provider/category/queryKey index covers all
        // entries that start with this term (queryKey is `${term}…`).
        const cached = await ctx.db.query("discovery_cache").take(500);
        for (const row of cached) {
          if (row.queryKey.toLowerCase().startsWith(oldTerm)) {
            await ctx.db.delete(row._id);
          }
        }
      }
    }

    const { tripId, ...patch } = args;
    const update: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(patch)) {
      if (val !== undefined) update[k] = val;
    }
    await ctx.db.patch(tripId, update);
    return await ctx.db.get(tripId);
  },
});

// Owner-only hard delete. Sweeps every dependent table so we don't leak rows
// — including deeply nested ones (poll options/votes, expense splits,
// checklist items). Convex limits per-mutation document writes, so for very
// large trips this may need to chunk via `ctx.scheduler.runAfter` — current
// usage is small enough to fit in one pass.
export const deleteTrip = mutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const { role } = await assertTripAccess(ctx, args.tripId);
    if (role !== "owner") {
      throw new Error("Only the trip owner can delete this trip");
    }
    await cascadeDeleteTripInternal(ctx, args.tripId);
    return { deleted: true };
  },
});

// Internal entrypoint for callers that have already done their own auth
// (e.g. account_deletion's hard cascade).
export const cascadeDeleteTrip = internalMutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    await cascadeDeleteTripInternal(ctx, args.tripId);
    return null;
  },
});

// Invite a user to the trip. Creates a pending trip_members row and a
// notification so the recipient sees an actionable card.
export const inviteToTrip = mutation({
  args: {
    tripId: v.id("trips"),
    inviteeId: v.id("users"),
    role: v.optional(v.union(v.literal("editor"), v.literal("viewer"))),
  },
  handler: async (ctx, args) => {
    const { userId, trip, role } = await assertTripAccess(ctx, args.tripId);
    if (role !== "owner" && role !== "editor") {
      throw new Error("Only members with edit access can invite others");
    }
    if (args.inviteeId === userId) {
      throw new Error("You're already on this trip");
    }

    const existing = await ctx.db
      .query("trip_members")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), args.inviteeId))
      .first();
    if (existing) {
      if (existing.status === "accepted")
        return { alreadyMember: true, memberId: existing._id };
      // Re-invite a previously declined/pending row by bumping status.
      await ctx.db.patch(existing._id, {
        status: "pending",
        invitedBy: userId,
        joinedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("trip_members", {
        tripId: args.tripId,
        userId: args.inviteeId,
        role: args.role ?? "viewer",
        invitedBy: userId,
        status: "pending",
        joinedAt: Date.now(),
      });
    }

    await ctx.db.insert("notifications", {
      userId: args.inviteeId,
      type: "trip_invite",
      data: {
        tripId: args.tripId,
        tripTitle: trip.title,
        tripSlug: trip.slug,
        invitedById: userId,
      },
      isRead: false,
      createdAt: Date.now(),
    });

    return { invited: true };
  },
});

// Accept or decline a pending invite. Used both from the notifications card
// and the share-link landing flow.
export const respondToInvite = mutation({
  args: {
    tripId: v.id("trips"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("trip_members")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    if (!member) throw new Error("No invite found");
    if (member.status === "accepted") return { alreadyAccepted: true };

    if (args.accept) {
      await ctx.db.patch(member._id, {
        status: "accepted",
        joinedAt: Date.now(),
      });
    } else {
      await ctx.db.delete(member._id);
    }
    return { ok: true };
  },
});

export const joinByCode = mutation({
  args: { joinCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const trip = await ctx.db
      .query("trips")
      .withIndex("by_join_code", (q) => q.eq("joinCode", args.joinCode))
      .unique();
    if (!trip) throw new Error("Invalid join code");

    const existing = await ctx.db
      .query("trip_members")
      .withIndex("by_trip", (q) => q.eq("tripId", trip._id))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) return trip._id;

    await ctx.db.insert("trip_members", {
      tripId: trip._id,
      userId,
      role: "viewer",
      status: "accepted",
      joinedAt: Date.now(),
    });

    return trip._id;
  },
});

// Plan-a-trip from an itinerary_template. Spins up a brand-new private trip
// owned by the caller, then materialises the template's days/items into the
// real itinerary tables so the new trip detail page is immediately useful.
//
// `startDate` defaults to today (UTC). The trip's date range is derived from
// the template's `durationDays` so the auto-generated days line up correctly.
const ITEM_TYPES = new Set([
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
type ItineraryItemType =
  | "flight" | "hotel" | "tour" | "car_rental" | "event"
  | "restaurant" | "activity" | "transport" | "other";

function normalizeItemType(raw: string | undefined): ItineraryItemType {
  if (raw && ITEM_TYPES.has(raw)) return raw as ItineraryItemType;
  return "activity";
}

export const createFromTemplate = mutation({
  args: {
    templateId: v.id("itinerary_templates"),
    title: v.optional(v.string()),
    startDate: v.optional(v.string()), // YYYY-MM-DD; defaults to today UTC
    visibility: v.optional(TRIP_VISIBILITY),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Itinerary template not found");

    const destination = await ctx.db.get(template.destinationId);
    if (!destination) throw new Error("Destination missing for template");

    const today = new Date().toISOString().slice(0, 10);
    const startDate = args.startDate ?? today;
    const startMs = Date.parse(startDate);
    if (Number.isNaN(startMs)) throw new Error("Invalid startDate");

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const days = Math.max(1, template.durationDays);
    const endMs = startMs + (days - 1) * MS_PER_DAY;
    const endDate = new Date(endMs).toISOString().slice(0, 10);

    const now = Date.now();
    const finalTitle = args.title ?? `${template.title}`;
    const slug = slugify(finalTitle);
    const cover = template.coverImageUrl ?? destination.heroImageUrl;
    // Trip currency is initialised from the template; held in a local so
    // the item materialisation loop below can reference it as the final
    // tier of the currency fallback chain without a re-read.
    const tripCurrency = template.currency;

    const tripId = await ctx.db.insert("trips", {
      title: finalTitle,
      description: template.description,
      destinationId: destination._id,
      destinationLabel: `${destination.name}, ${destination.country}`,
      destinationCoords: destination.coords,
      creatorId: userId,
      startDate,
      endDate,
      visibility: args.visibility ?? "private",
      status: "planning",
      coverImageUrl: cover,
      slug,
      joinCode: randomId(JOIN_CODE_ALPHABET, 8),
      currency: tripCurrency,
      sourceTemplateId: template._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("trip_members", {
      tripId,
      userId,
      status: "accepted",
      role: "owner",
      joinedAt: now,
    });

    // Bump the template's copy count for popularity tracking.
    await ctx.db.patch(template._id, {
      timesCopied: (template.timesCopied ?? 0) + 1,
    });

    // Materialise template days/items.
    for (let i = 0; i < days; i++) {
      const tplDay = template.days[i];
      const date = new Date(startMs + i * MS_PER_DAY)
        .toISOString()
        .slice(0, 10);

      const dayId = await ctx.db.insert("itinerary_days", {
        tripId,
        date,
        dayNumber: i + 1,
        title: tplDay?.title,
        createdAt: now,
      });

      const items = tplDay?.items ?? [];
      // Field-mapping contract — template item → itinerary_items row:
      //   it.time          → startTime
      //   it.endTime       → endTime
      //   it.estimatedCost → price
      //   it.currency      → currency, falling back template.currency,
      //                      then trip.currency (already template.currency
      //                      today, but the chain is explicit so future
      //                      callers can override trip currency safely)
      //   it.imageUrl      → imageUrl       (preserve admin-curated cover)
      //   it.externalUrl   → externalUrl    (preserve booking link)
      //   it.type          → type, run through normalizeItemType because
      //                      the template's narrower vocabulary
      //                      (food/lodging/free) doesn't intersect 1:1
      //                      with the itinerary_items enum
      //   apiSource/apiRef pass through unchanged
      for (let j = 0; j < items.length; j++) {
        const it = items[j];
        await ctx.db.insert("itinerary_items", {
          tripId,
          dayId,
          addedByUserId: userId,
          type: normalizeItemType(it.type),
          apiSource: it.apiSource,
          apiRef: it.apiRef,
          title: it.title,
          description: it.description,
          imageUrl: it.imageUrl,
          startTime: it.time,
          endTime: it.endTime,
          locationName: it.locationName,
          coords: it.coords,
          externalUrl: it.externalUrl,
          price: it.estimatedCost,
          currency: it.currency ?? template.currency ?? tripCurrency,
          isCompleted: false,
          sortOrder: j,
          canBeEditedBy: "editors",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { tripId, slug };
  },
});

export const cloneTrip = mutation({
  args: {
    tripId: v.id("trips"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const source = await ctx.db.get(args.tripId);
    if (!source) throw new Error("Trip not found");

    // Must be public OR the cloner must be a member.
    if (source.visibility !== "public") {
      const member = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("tripId", source._id))
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();
      if (!member) throw new Error("Not authorized to clone this trip");
    }

    const now = Date.now();
    const newTitle = args.title ?? `${source.title} (copy)`;
    const newTripId = await ctx.db.insert("trips", {
      title: newTitle,
      description: source.description,
      destinationId: source.destinationId,
      destinationLabel: source.destinationLabel,
      destinationCoords: source.destinationCoords,
      creatorId: userId,
      startDate: source.startDate,
      endDate: source.endDate,
      category: source.category,
      visibility: "private",
      status: "planning",
      coverImageUrl: source.coverImageUrl,
      slug: slugify(newTitle),
      joinCode: randomId(JOIN_CODE_ALPHABET, 8),
      estimatedBudget: source.estimatedBudget,
      currency: source.currency,
      clonedFromId: source._id,
      sourceTemplateId: source.sourceTemplateId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("trip_members", {
      tripId: newTripId,
      userId,
      role: "owner",
      status: "accepted",
      joinedAt: now,
    });

    const days = await ctx.db
      .query("itinerary_days")
      .withIndex("by_trip", (q) => q.eq("tripId", source._id))
      .collect();

    const dayIdMap = new Map<Id<"itinerary_days">, Id<"itinerary_days">>();
    for (const day of days) {
      const newDayId = await ctx.db.insert("itinerary_days", {
        tripId: newTripId,
        date: day.date,
        dayNumber: day.dayNumber,
        title: day.title,
        notes: day.notes,
        createdAt: now,
      });
      dayIdMap.set(day._id, newDayId);
    }

    const items = await ctx.db
      .query("itinerary_items")
      .withIndex("by_trip", (q) => q.eq("tripId", source._id))
      .collect();

    for (const item of items) {
      const newDayId = dayIdMap.get(item.dayId);
      if (!newDayId) continue;
      await ctx.db.insert("itinerary_items", {
        tripId: newTripId,
        dayId: newDayId,
        addedByUserId: userId,
        type: item.type,
        apiSource: item.apiSource,
        apiRef: item.apiRef,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        currency: item.currency,
        startTime: item.startTime,
        endTime: item.endTime,
        locationName: item.locationName,
        coords: item.coords,
        bookingReference: undefined,
        notes: item.notes,
        isCompleted: false,
        sortOrder: item.sortOrder,
        canBeEditedBy: item.canBeEditedBy,
        createdAt: now,
        updatedAt: now,
      });
    }

    const saved = await ctx.db
      .query("saved_items")
      .withIndex("by_trip", (q) => q.eq("tripId", source._id))
      .collect();

    for (const s of saved) {
      await ctx.db.insert("saved_items", {
        tripId: newTripId,
        addedByUserId: userId,
        type: s.type,
        apiSource: s.apiSource,
        apiRef: s.apiRef,
        title: s.title,
        description: s.description,
        imageUrl: s.imageUrl,
        price: s.price,
        currency: s.currency,
        date: s.date,
        endDate: s.endDate,
        locationName: s.locationName,
        coords: s.coords,
        externalUrl: s.externalUrl,
        notes: s.notes,
        isManual: s.isManual,
        addedToItinerary: false,
        createdAt: now,
      });
    }

    return newTripId;
  },
});
