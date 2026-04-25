import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

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
