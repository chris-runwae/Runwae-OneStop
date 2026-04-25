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

    await ctx.db.insert("notifications", {
      userId: args.addresseeId,
      type: "friend_request",
      data: { friendshipId: id, requesterId: userId },
      isRead: false,
      createdAt: now,
    });

    return id;
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

    // saved_items are trip-scoped; filter to those added by friends.
    const allSaved = await ctx.db.query("saved_items").collect();
    for (const s of allSaved) {
      if (!friendSet.has(s.addedByUserId)) continue;
      const trip = await ctx.db.get(s.tripId);
      if (!trip) continue;
      if (trip.visibility === "private") continue;
      events.push({
        kind: "item_saved",
        actorId: s.addedByUserId,
        createdAt: s.createdAt,
        savedItem: s,
      });
    }

    events.sort((a, b) => b.createdAt - a.createdAt);
    return events.slice(0, 20);
  },
});
