import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

// ── Shared insert helper ────────────────────────────────────────────
// Every fan-out site (trip invite, friend request, expense added, …)
// should call this instead of `ctx.db.insert("notifications", …)`
// directly so the in-app row and the matching push notification stay
// in lock-step. Schedules `push.sendToUser` after a 0ms delay so the
// caller's transaction commits first.
type NotificationInsert = Omit<Doc<"notifications">, "_id" | "_creationTime"> & {
  push?: { title: string; body: string };
};

export async function insertNotification(
  ctx: MutationCtx,
  input: NotificationInsert,
): Promise<Id<"notifications">> {
  const { push, ...row } = input;
  const id = await ctx.db.insert("notifications", row);
  if (push) {
    await ctx.scheduler.runAfter(0, internal.push.sendToUser, {
      userId: row.userId,
      title: push.title,
      body: push.body,
      data: row.data,
    });
  }
  return id;
}

// Internal trampoline so other Convex modules can call the
// helper through `ctx.runMutation(internal.notifications._fanOut, …)`
// when they don't want to import the helper directly.
export const _fanOut = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    data: v.any(),
    pushTitle: v.optional(v.string()),
    pushBody: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await insertNotification(ctx, {
      userId: args.userId,
      type: args.type as Doc<"notifications">["type"],
      data: args.data,
      isRead: false,
      createdAt: Date.now(),
      ...(args.pushTitle && args.pushBody
        ? { push: { title: args.pushTitle, body: args.pushBody } }
        : {}),
    });
  },
});

export const list = query({
  args: { onlyUnread: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    if (args.onlyUnread) {
      return await ctx.db
        .query("notifications")
        .withIndex("by_user_unread", (q) =>
          q.eq("userId", userId).eq("isRead", false)
        )
        .order("desc")
        .collect();
    }
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", userId).eq("isRead", false)
      )
      .collect();
    const read = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", userId).eq("isRead", true)
      )
      .collect();
    return [...unread, ...read].sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return 0;
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", userId).eq("isRead", false)
      )
      .collect();
    return rows.length;
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const notif = await ctx.db.get(args.notificationId);
    if (!notif) return;
    if (notif.userId !== userId) throw new Error("Not your notification");
    if (!notif.isRead) await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", userId).eq("isRead", false)
      )
      .collect();
    for (const r of rows) await ctx.db.patch(r._id, { isRead: true });
    return { marked: rows.length };
  },
});
