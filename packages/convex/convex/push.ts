import { v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

const PLATFORM = v.union(v.literal("ios"), v.literal("android"));

/**
 * Mobile clients call this on app foreground after auth so we always
 * have a fresh `lastVerifiedAt`. Re-registering the same (userId,
 * deviceId) pair is idempotent — we patch the existing row instead of
 * inserting a duplicate.
 */
export const registerToken = mutation({
  args: {
    token: v.string(),
    platform: PLATFORM,
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const now = Date.now();
    const existing = await ctx.db
      .query("device_tokens")
      .withIndex("by_user_device", (q) =>
        q.eq("userId", userId).eq("deviceId", args.deviceId),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        token: args.token,
        platform: args.platform,
        isActive: true,
        lastVerifiedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("device_tokens", {
      userId,
      token: args.token,
      platform: args.platform,
      deviceId: args.deviceId,
      isActive: true,
      lastVerifiedAt: now,
      createdAt: now,
    });
  },
});

/**
 * Called on sign-out and when the OS revokes notification permissions.
 * Rather than delete the row we flip `isActive` so we keep history for
 * audit + can re-activate cheaply on the next foreground.
 */
export const unregisterToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const row = await ctx.db
      .query("device_tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (row && row.userId === userId) {
      await ctx.db.patch(row._id, { isActive: false });
    }
    return { ok: true };
  },
});

// ── Internal: read active tokens for a user ─────────────────────────
export const _getActiveTokens = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("device_tokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// ── Internal: deactivate tokens that Expo flagged as invalid ────────
export const _deactivateTokens = internalMutation({
  args: { tokens: v.array(v.string()) },
  handler: async (ctx, { tokens }) => {
    for (const token of tokens) {
      const row = await ctx.db
        .query("device_tokens")
        .withIndex("by_token", (q) => q.eq("token", token))
        .unique();
      if (row) await ctx.db.patch(row._id, { isActive: false });
    }
  },
});

/**
 * Send a push notification to every active device a user owns. Called
 * from in-app notification fan-out sites (notifications.ts insert
 * paths) so the user gets in-app + push in lock-step.
 *
 * Uses the Expo Push API directly — no SDK dependency, just a fetch.
 * Expo handles APNs/FCM routing for us.
 */
export const sendToUser = internalAction({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args): Promise<{ sent: number; deactivated: number }> => {
    const tokens: Array<{
      _id: Id<"device_tokens">;
      token: string;
    }> = await ctx.runQuery(internal.push._getActiveTokens, {
      userId: args.userId,
    });
    if (tokens.length === 0) return { sent: 0, deactivated: 0 };

    const messages = tokens.map((row) => ({
      to: row.token,
      sound: "default" as const,
      title: args.title,
      body: args.body,
      data: args.data,
    }));

    try {
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });
      if (!res.ok) {
        console.warn("[push] Expo rejected the batch", res.status);
        return { sent: 0, deactivated: 0 };
      }
      const json = (await res.json()) as {
        data?: Array<{ status: string; message?: string; details?: any }>;
      };

      // Expo flags revoked tokens with status: "error" and details:
      // { error: "DeviceNotRegistered" }. Deactivate those so we stop
      // pinging them on the next fan-out.
      const tokensToDisable: string[] = [];
      (json.data ?? []).forEach((entry, i) => {
        if (
          entry.status === "error" &&
          entry.details?.error === "DeviceNotRegistered"
        ) {
          tokensToDisable.push(tokens[i].token);
        }
      });
      if (tokensToDisable.length > 0) {
        await ctx.runMutation(internal.push._deactivateTokens, {
          tokens: tokensToDisable,
        });
      }
      return {
        sent: messages.length - tokensToDisable.length,
        deactivated: tokensToDisable.length,
      };
    } catch (err) {
      console.warn("[push] fetch failed", err);
      return { sent: 0, deactivated: 0 };
    }
  },
});

// Public action mirror for in-app callers that already have a userId
// in scope (e.g. the mutation that just inserted a notification).
// Handlers schedule this with `ctx.scheduler.runAfter(0, ...)` so it
// runs in the action runtime where fetch is allowed.
export const sendToUserPublic = action({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args): Promise<{ sent: number; deactivated: number }> => {
    return await ctx.runAction(internal.push.sendToUser, args);
  },
});
