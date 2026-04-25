import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
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
    return await ctx.db.get(userId);
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { onboardingComplete: true });
    return await ctx.db.get(userId);
  },
});

export const searchByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const needle = email.trim().toLowerCase();
    if (needle.length < 3) return [];
    const me = await getAuthUserId(ctx);
    const all = await ctx.db.query("users").collect();
    return all
      .filter(
        (u) =>
          u._id !== me &&
          typeof u.email === "string" &&
          u.email.toLowerCase().includes(needle)
      )
      .slice(0, 5)
      .map((u) => ({ _id: u._id, name: u.name, image: u.image }));
  },
});

// Schema has no `username` field. Resolving by `name` (unindexed filter).
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.username))
      .first();
  },
});
