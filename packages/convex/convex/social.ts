import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

type ActivityEvent =
  | {
      kind: "trip_created";
      actorId: Id<"users">;
      createdAt: number;
      trip: Doc<"trips">;
    }
  | {
      kind: "event_going";
      actorId: Id<"users">;
      createdAt: number;
      attendee: Doc<"event_attendees">;
      event: Doc<"events"> | null;
    }
  | {
      kind: "item_saved";
      actorId: Id<"users">;
      createdAt: number;
      savedItem: Doc<"saved_items">;
    }
  | {
      kind: "trip_post";
      actorId: Id<"users">;
      createdAt: number;
      post: Doc<"trip_posts">;
      trip: Doc<"trips"> | null;
    }
  | {
      kind: "user_save";
      actorId: Id<"users">;
      createdAt: number;
      save: Doc<"user_saves">;
    };

async function findPair(
  ctx: any,
  a: Id<"users">,
  b: Id<"users">
): Promise<Doc<"friendships"> | null> {
  const one = await ctx.db
    .query("friendships")
    .withIndex("by_pair", (q: any) =>
      q.eq("requesterId", a).eq("addresseeId", b)
    )
    .first();
  if (one) return one;
  const two = await ctx.db
    .query("friendships")
    .withIndex("by_pair", (q: any) =>
      q.eq("requesterId", b).eq("addresseeId", a)
    )
    .first();
  return two;
}

export const sendFriendRequest = mutation({
  args: { addresseeId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    if (userId === args.addresseeId) {
      throw new Error("Cannot friend yourself");
    }

    const existing = await findPair(ctx, userId, args.addresseeId);
    if (existing) return existing._id;

    const now = Date.now();
    const id = await ctx.db.insert("friendships", {
      requesterId: userId,
      addresseeId: args.addresseeId,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Snapshot the requester's display info so the notification card can
    // render "X wants to be friends" without a follow-up join.
    const me = await ctx.db.get(userId);
    await ctx.db.insert("notifications", {
      userId: args.addresseeId,
      type: "friend_request",
      data: {
        friendshipId: id,
        requesterId: userId,
        requesterName: me?.name ?? null,
        requesterUsername: me?.username ?? null,
        requesterImage: me?.image ?? null,
      },
      isRead: false,
      createdAt: now,
    });

    return id;
  },
});

// "Most-recently-interacted" friends, scored by a few signals:
//   - Co-membership on a shared trip (5 points)
//   - Co-attendance of an event (3 points)
//   - Recent friend_accepted timestamp (1 point per week of recency)
// Returns up to `limit` accepted friends sorted by score desc. The trip
// creation invite step uses this to pre-populate quick-pick avatars.
export const recentFriends = query({
  args: { limit: v.optional(v.number()) },
  handler: async (
    ctx,
    { limit }
  ): Promise<
    Array<{
      _id: Id<"users">;
      name?: string | null;
      username?: string | null;
      image?: string | null;
      score: number;
    }>
  > => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const friendIds = await getFriendUserIds(ctx, userId);
    if (friendIds.length === 0) return [];
    const friendSet = new Set(friendIds);

    // Friend → score map.
    const score = new Map<Id<"users">, number>();
    for (const id of friendIds) score.set(id, 0);

    // 1. Co-trip membership (any trip the viewer is on, count overlaps).
    const myMemberships = await ctx.db
      .query("trip_members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const m of myMemberships) {
      const others = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("tripId", m.tripId))
        .collect();
      for (const o of others) {
        if (o.userId === userId) continue;
        if (!friendSet.has(o.userId)) continue;
        score.set(o.userId, (score.get(o.userId) ?? 0) + 5);
      }
    }

    // 2. Co-event attendance (events the viewer RSVP'd "going").
    const myAttendees = await ctx.db
      .query("event_attendees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const a of myAttendees) {
      if (a.status !== "going") continue;
      const others = await ctx.db
        .query("event_attendees")
        .withIndex("by_event", (q) => q.eq("eventId", a.eventId))
        .collect();
      for (const o of others) {
        if (o.userId === userId) continue;
        if (o.status !== "going") continue;
        if (!friendSet.has(o.userId)) continue;
        score.set(o.userId, (score.get(o.userId) ?? 0) + 3);
      }
    }

    // 3. Friendship recency — accepted within the last ~6 months gets a
    //    bonus that decays linearly. Older accepted friends get 0 here.
    const now = Date.now();
    const SIX_MONTHS = 6 * 30 * 24 * 60 * 60 * 1000;
    const friendships = [
      ...(await ctx.db
        .query("friendships")
        .withIndex("by_requester", (q) => q.eq("requesterId", userId))
        .collect()),
      ...(await ctx.db
        .query("friendships")
        .withIndex("by_addressee", (q) => q.eq("addresseeId", userId))
        .collect()),
    ];
    for (const f of friendships) {
      if (f.status !== "accepted") continue;
      const otherId = f.requesterId === userId ? f.addresseeId : f.requesterId;
      if (!friendSet.has(otherId)) continue;
      const ageMs = now - (f.updatedAt ?? f.createdAt);
      if (ageMs < SIX_MONTHS) {
        const weeksRecent = Math.max(0, (SIX_MONTHS - ageMs) / (7 * 24 * 60 * 60 * 1000));
        score.set(otherId, (score.get(otherId) ?? 0) + weeksRecent);
      }
    }

    const ranked = Array.from(score.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit ?? 5);

    const enriched = await Promise.all(
      ranked.map(async ([id, s]) => {
        const u = await ctx.db.get(id);
        return {
          _id: id,
          name: u?.name ?? null,
          username: u?.username ?? null,
          image: u?.image ?? null,
          score: Math.round(s * 10) / 10,
        };
      })
    );
    return enriched;
  },
});

// Pending incoming friend requests, hydrated with the requester's profile so
// the /feed page can render accept/decline prompt cards inline.
export const listPendingFriendRequests = query({
  args: {},
  handler: async (
    ctx
  ): Promise<
    Array<{
      friendshipId: Id<"friendships">;
      createdAt: number;
      requester: {
        _id: Id<"users">;
        name?: string | null;
        username?: string | null;
        image?: string | null;
      };
    }>
  > => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const incoming = await ctx.db
      .query("friendships")
      .withIndex("by_addressee", (q) => q.eq("addresseeId", userId))
      .collect();
    const pending = incoming
      .filter((f) => f.status === "pending")
      .sort((a, b) => b.createdAt - a.createdAt);

    const enriched = await Promise.all(
      pending.map(async (fr) => {
        const u = await ctx.db.get(fr.requesterId);
        return {
          friendshipId: fr._id,
          createdAt: fr.createdAt,
          requester: {
            _id: fr.requesterId,
            name: u?.name ?? null,
            username: u?.username ?? null,
            image: u?.image ?? null,
          },
        };
      })
    );
    return enriched;
  },
});

export const respondToFriendRequest = mutation({
  args: {
    friendshipId: v.id("friendships"),
    action: v.union(v.literal("accept"), v.literal("decline")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const fr = await ctx.db.get(args.friendshipId);
    if (!fr) throw new Error("Friend request not found");
    if (fr.addresseeId !== userId) {
      throw new Error("Not authorized to respond to this request");
    }
    if (fr.status !== "pending") {
      throw new Error("Request already handled");
    }

    if (args.action === "decline") {
      await ctx.db.delete(fr._id);
      return { ok: true, status: "declined" as const };
    }

    const now = Date.now();
    await ctx.db.patch(fr._id, { status: "accepted", updatedAt: now });
    await ctx.db.insert("notifications", {
      userId: fr.requesterId,
      type: "friend_accepted",
      data: { friendshipId: fr._id, addresseeId: userId },
      isRead: false,
      createdAt: now,
    });
    return { ok: true, status: "accepted" as const };
  },
});

async function getFriendUserIds(
  ctx: any,
  userId: Id<"users">
): Promise<Id<"users">[]> {
  const outgoing = await ctx.db
    .query("friendships")
    .withIndex("by_requester", (q: any) => q.eq("requesterId", userId))
    .collect();
  const incoming = await ctx.db
    .query("friendships")
    .withIndex("by_addressee", (q: any) => q.eq("addresseeId", userId))
    .collect();

  const ids: Id<"users">[] = [];
  for (const f of outgoing) if (f.status === "accepted") ids.push(f.addresseeId);
  for (const f of incoming) if (f.status === "accepted") ids.push(f.requesterId);
  return ids;
}

export const getFriends = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const friendIds = await getFriendUserIds(ctx, userId);
    const users = await Promise.all(friendIds.map((id) => ctx.db.get(id)));
    return users.filter((u): u is Doc<"users"> => u !== null);
  },
});

export const getFriendActivity = query({
  args: {},
  handler: async (ctx): Promise<ActivityEvent[]> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const friendIds = await getFriendUserIds(ctx, userId);
    if (friendIds.length === 0) return [];
    const friendSet = new Set(friendIds);

    const events: ActivityEvent[] = [];

    for (const fid of friendIds) {
      const trips = await ctx.db
        .query("trips")
        .withIndex("by_creator", (q) => q.eq("creatorId", fid))
        .collect();
      for (const t of trips) {
        if (t.visibility === "private") continue;
        events.push({
          kind: "trip_created",
          actorId: fid,
          createdAt: t.createdAt,
          trip: t,
        });
      }
    }

    for (const fid of friendIds) {
      const attendees = await ctx.db
        .query("event_attendees")
        .withIndex("by_user", (q) => q.eq("userId", fid))
        .collect();
      for (const a of attendees) {
        if (a.status !== "going") continue;
        const ev = await ctx.db.get(a.eventId);
        events.push({
          kind: "event_going",
          actorId: fid,
          createdAt: a.createdAt,
          attendee: a,
          event: ev,
        });
      }
    }

    void friendSet;
    // saved_items by friend, using by_added_by index (no full-table scan).
    for (const fid of friendIds) {
      const saves = await ctx.db
        .query("saved_items")
        .withIndex("by_added_by", (q) => q.eq("addedByUserId", fid))
        .collect();
      for (const s of saves) {
        const trip = await ctx.db.get(s.tripId);
        if (!trip) continue;
        if (trip.visibility === "private") continue;
        events.push({
          kind: "item_saved",
          actorId: fid,
          createdAt: s.createdAt,
          savedItem: s,
        });
      }
    }

    events.sort((a, b) => b.createdAt - a.createdAt);
    return events.slice(0, 20);
  },
});

// Friend activity hydrated with actor profile (avatar/name/username) and
// optionally paginated. The home page and /feed both use this.
export type HydratedActivity = ActivityEvent & {
  actor: {
    _id: Id<"users">;
    name?: string | null;
    image?: string | null;
    username?: string | null;
  };
};

export const getFriendActivityHydrated = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }): Promise<HydratedActivity[]> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const friendIds = await getFriendUserIds(ctx, userId);
    if (friendIds.length === 0) return [];

    const events: ActivityEvent[] = [];

    for (const fid of friendIds) {
      const trips = await ctx.db
        .query("trips")
        .withIndex("by_creator", (q) => q.eq("creatorId", fid))
        .collect();
      for (const t of trips) {
        if (t.visibility === "private") continue;
        events.push({ kind: "trip_created", actorId: fid, createdAt: t.createdAt, trip: t });
      }

      const attendees = await ctx.db
        .query("event_attendees")
        .withIndex("by_user", (q) => q.eq("userId", fid))
        .collect();
      for (const a of attendees) {
        if (a.status !== "going") continue;
        const ev = await ctx.db.get(a.eventId);
        events.push({ kind: "event_going", actorId: fid, createdAt: a.createdAt, attendee: a, event: ev });
      }

      const saves = await ctx.db
        .query("saved_items")
        .withIndex("by_added_by", (q) => q.eq("addedByUserId", fid))
        .collect();
      for (const s of saves) {
        const trip = await ctx.db.get(s.tripId);
        if (!trip || trip.visibility === "private") continue;
        events.push({ kind: "item_saved", actorId: fid, createdAt: s.createdAt, savedItem: s });
      }

      // Trip posts authored by the friend on a non-private trip — visible
      // social activity, equivalent to "X posted on their trip".
      const posts = await ctx.db
        .query("trip_posts")
        .filter((q) => q.eq(q.field("createdByUserId"), fid))
        .collect();
      for (const p of posts) {
        const trip = await ctx.db.get(p.tripId);
        if (!trip || trip.visibility === "private") continue;
        events.push({
          kind: "trip_post",
          actorId: fid,
          createdAt: p.createdAt,
          post: p,
          trip,
        });
      }

      // User-level saves (the "heart" on Discover cards) — public by nature.
      const userSaves = await ctx.db
        .query("user_saves")
        .withIndex("by_user", (q) => q.eq("userId", fid))
        .collect();
      for (const s of userSaves) {
        events.push({
          kind: "user_save",
          actorId: fid,
          createdAt: s.createdAt,
          save: s,
        });
      }
    }

    events.sort((a, b) => b.createdAt - a.createdAt);
    const cap = limit ?? 20;
    const top = events.slice(0, cap);

    const actorIds = Array.from(new Set(top.map((e) => e.actorId)));
    const actors = await Promise.all(actorIds.map((id) => ctx.db.get(id)));
    const actorById = new Map<string, Doc<"users"> | null>();
    actorIds.forEach((id, i) => actorById.set(id, actors[i] ?? null));

    return top.map((e) => {
      const u = actorById.get(e.actorId);
      return {
        ...e,
        actor: {
          _id: e.actorId,
          name: u?.name ?? null,
          image: u?.image ?? null,
          username: u?.username ?? null,
        },
      };
    });
  },
});
