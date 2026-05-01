import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, internalMutation } from "./_generated/server";
import { buildCandidate, validateUsername } from "./lib/username";
import {
  toPublicUserSelfOrNull,
  toPublicUserOther,
  toPublicUserOtherOrNull,
} from "./lib/user_sanitize";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const u = await ctx.db.get(userId);
    return toPublicUserSelfOrNull(u);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    preferredCurrency: v.optional(v.string()),
    preferredTimezone: v.optional(v.string()),
    travellerTags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db.get(userId);
    if (!existing) throw new Error("User not found");

    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.avatarUrl !== undefined) patch.avatarUrl = args.avatarUrl;
    if (args.preferredCurrency !== undefined)
      patch.preferredCurrency = args.preferredCurrency;
    if (args.preferredTimezone !== undefined) {
      // Validate against the runtime IANA database to reject typos like "London"
      // (must be "Europe/London") or invented strings like "Ghana".
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: args.preferredTimezone });
      } catch {
        throw new Error(
          `Unknown timezone "${args.preferredTimezone}" — pass an IANA id like "Europe/London".`
        );
      }
      patch.preferredTimezone = args.preferredTimezone;
    }
    if (args.travellerTags !== undefined) patch.travellerTags = args.travellerTags;

    if (existing.createdAt === undefined) patch.createdAt = Date.now();

    await ctx.db.patch(userId, patch);
    const u = await ctx.db.get(userId);
    return toPublicUserSelfOrNull(u);
  },
});

// Avatar upload uses Convex storage so we don't need a third-party provider.
// Client flow: call generateAvatarUploadUrl → PUT the file to that URL →
// receive { storageId } → call setAvatar({ storageId }).
export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const setAvatar = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new Error("Upload not found");
    // Mirror to both `image` (used by @convex-dev/auth's row defaults) and
    // `avatarUrl` (the app field) so existing readers don't have to change.
    await ctx.db.patch(userId, { image: url, avatarUrl: url });
    return url;
  },
});

export const setHomeLocation = mutation({
  args: {
    coords: v.object({ lat: v.number(), lng: v.number() }),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    iata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const patch: Record<string, unknown> = { homeCoords: args.coords };
    if (args.city !== undefined) patch.homeCity = args.city;
    if (args.country !== undefined) patch.homeCountry = args.country;
    if (args.iata !== undefined) patch.homeIata = args.iata?.toUpperCase();
    await ctx.db.patch(userId, patch);
    const u = await ctx.db.get(userId);
    return toPublicUserSelfOrNull(u);
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { onboardingComplete: true });
    const u = await ctx.db.get(userId);
    return toPublicUserSelfOrNull(u);
  },
});

// ── Usernames ──────────────────────────────────────────────────────────────

export const isUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const u = username.trim().toLowerCase();
    const validation = validateUsername(u);
    if (!validation.ok) return { available: false, reason: validation.reason };
    const me = await getAuthUserId(ctx);
    const taken = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", u))
      .first();
    if (taken && taken._id !== me) return { available: false, reason: "Already taken." };
    return { available: true };
  },
});

export const setUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const u = username.trim().toLowerCase();
    const validation = validateUsername(u);
    if (!validation.ok) throw new Error(validation.reason);
    const taken = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", u))
      .first();
    if (taken && taken._id !== userId) throw new Error("Username already taken.");
    await ctx.db.patch(userId, { username: u });
    const updated = await ctx.db.get(userId);
    return toPublicUserSelfOrNull(updated);
  },
});

export const searchByUsername = query({
  args: { term: v.string() },
  handler: async (ctx, { term }) => {
    const needle = term.trim().toLowerCase();
    if (needle.length < 2) return [];
    const me = await getAuthUserId(ctx);
    // Index range scan: usernames starting with the needle
    const matches = await ctx.db
      .query("users")
      .withIndex("by_username", (q) =>
        q.gte("username", needle).lt("username", needle + "￿")
      )
      .take(10);
    return matches
      .filter((u) => u._id !== me)
      .filter((u) => !u.isSystemSentinel)
      .filter((u) => u.deletedAt === undefined)
      .slice(0, 5)
      .map((u) => ({
        _id: u._id,
        name: u.name,
        image: u.image,
        username: u.username,
      }));
  },
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username.trim().toLowerCase()))
      .first();
    if (!user || user.isSystemSentinel) return null;
    return toPublicUserOther(user);
  },
});

// One-shot: assigns usernames to any existing rows that don't have one.
// Run via the Convex dashboard's "Run a function" panel after the schema deploy.
// Idempotent — safe to run repeatedly.
export const backfillUsernames = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("users").collect();
    let assigned = 0;
    for (const user of all) {
      if (user.username) continue;
      if (user.isSystemSentinel) continue;
      const base = user.name ?? user.email?.split("@")[0] ?? "user";
      let username: string | undefined;
      for (let attempt = 0; attempt < 6; attempt++) {
        const candidate = buildCandidate(base, attempt);
        const collision = await ctx.db
          .query("users")
          .withIndex("by_username", (q) => q.eq("username", candidate))
          .first();
        if (!collision) {
          username = candidate;
          break;
        }
      }
      if (!username) {
        console.warn("[backfillUsernames] could not find a candidate for", user._id);
        continue;
      }
      await ctx.db.patch(user._id, { username });
      assigned++;
    }
    return { assigned, total: all.length };
  },
});
