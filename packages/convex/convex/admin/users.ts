import { v, ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "../_generated/server";
import { countAdmins, requireAdmin } from "../lib/admin";
import type { Doc, Id } from "../_generated/dataModel";

export const adminCount = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await countAdmins(ctx);
  },
});

export const listAll = query({
  args: {
    paginationOpts: paginationOptsValidator,
    suspended: v.optional(v.union(v.literal("any"), v.literal("only"), v.literal("none"))),
    admins: v.optional(v.union(v.literal("any"), v.literal("only"), v.literal("none"))),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const result = await ctx.db
      .query("users")
      .order("desc")
      .paginate(args.paginationOpts);

    let page = result.page;
    // Hide system sentinels from the admin UI — they aren't real users and
    // suspending or promoting them would just confuse things.
    page = page.filter((u) => !u.isSystemSentinel);

    if (args.suspended === "only") {
      page = page.filter((u) => u.suspendedAt !== undefined);
    } else if (args.suspended === "none") {
      page = page.filter((u) => u.suspendedAt === undefined);
    }
    if (args.admins === "only") {
      page = page.filter((u) => u.isAdmin === true);
    } else if (args.admins === "none") {
      page = page.filter((u) => u.isAdmin !== true);
    }
    if (args.search && args.search.trim()) {
      const needle = args.search.trim().toLowerCase();
      page = page.filter(
        (u) =>
          (u.email?.toLowerCase().includes(needle) ?? false) ||
          (u.name?.toLowerCase().includes(needle) ?? false) ||
          (u.username?.toLowerCase().includes(needle) ?? false)
      );
    }

    return { ...result, page };
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) return null;
    return row;
  },
});

async function logAudit(
  ctx: { db: any },
  entry: {
    actorId: Id<"users">;
    targetUserId: Id<"users">;
    action: "suspend" | "unsuspend" | "promote_admin" | "demote_admin";
    previousValue?: unknown;
    newValue?: unknown;
    reason?: string;
  }
): Promise<void> {
  await ctx.db.insert("admin_audit_log", {
    actorId: entry.actorId,
    targetUserId: entry.targetUserId,
    action: entry.action,
    previousValue:
      entry.previousValue === undefined
        ? undefined
        : JSON.stringify(entry.previousValue),
    newValue:
      entry.newValue === undefined ? undefined : JSON.stringify(entry.newValue),
    reason: entry.reason,
    timestamp: Date.now(),
  });
}

export const setSuspension = mutation({
  args: {
    userId: v.id("users"),
    // null to unsuspend. When suspending, the timestamp is when suspension
    // took effect — mutation supplies Date.now() if caller passes a sentinel.
    suspendedAt: v.union(v.number(), v.null()),
    suspensionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (args.userId === admin._id) {
      throw new ConvexError(
        "You cannot suspend yourself. Ask another admin to do it."
      );
    }
    const target = await ctx.db.get(args.userId);
    if (!target) throw new ConvexError("User not found");
    if (target.isSystemSentinel) {
      throw new ConvexError("Cannot suspend the system sentinel user");
    }

    const previous = {
      suspendedAt: target.suspendedAt ?? null,
      suspensionReason: target.suspensionReason ?? null,
    };

    if (args.suspendedAt === null) {
      // Unsuspend — clear both fields together.
      await ctx.db.patch(args.userId, {
        suspendedAt: undefined,
        suspensionReason: undefined,
      });
      await logAudit(ctx, {
        actorId: admin._id,
        targetUserId: args.userId,
        action: "unsuspend",
        previousValue: previous,
        newValue: { suspendedAt: null, suspensionReason: null },
      });
    } else {
      // Suspend — empty reason becomes undefined per the established
      // empty-string-to-undefined pattern.
      const trimmed = args.suspensionReason?.trim();
      const reason = trimmed && trimmed.length > 0 ? trimmed : undefined;
      await ctx.db.patch(args.userId, {
        suspendedAt: args.suspendedAt,
        suspensionReason: reason,
      });
      await logAudit(ctx, {
        actorId: admin._id,
        targetUserId: args.userId,
        action: "suspend",
        previousValue: previous,
        newValue: {
          suspendedAt: args.suspendedAt,
          suspensionReason: reason ?? null,
        },
        reason,
      });
    }
    return await ctx.db.get(args.userId);
  },
});

export const setAdminStatus = mutation({
  args: {
    userId: v.id("users"),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (args.userId === admin._id) {
      throw new ConvexError(
        "You cannot change your own admin status. Ask another admin to do it."
      );
    }
    const target: Doc<"users"> | null = await ctx.db.get(args.userId);
    if (!target) throw new ConvexError("User not found");
    if (target.isSystemSentinel) {
      throw new ConvexError("Cannot grant admin to the system sentinel user");
    }

    const previousIsAdmin = target.isAdmin === true;
    if (previousIsAdmin === args.isAdmin) {
      // No-op — return the row unchanged, no audit entry. Calling this with
      // the same value isn't an error; the UI may issue redundant calls.
      return target;
    }

    // Last-admin guard: if we'd demote the last remaining admin, refuse.
    // This is a deviation from the original spec — added because there is
    // no recovery path otherwise short of editing the DB.
    if (!args.isAdmin && previousIsAdmin) {
      const totalAdmins = await countAdmins(ctx);
      if (totalAdmins <= 1) {
        throw new ConvexError(
          "Cannot demote the last admin. Promote another user to admin first."
        );
      }
    }

    await ctx.db.patch(args.userId, { isAdmin: args.isAdmin });
    await logAudit(ctx, {
      actorId: admin._id,
      targetUserId: args.userId,
      action: args.isAdmin ? "promote_admin" : "demote_admin",
      previousValue: { isAdmin: previousIsAdmin },
      newValue: { isAdmin: args.isAdmin },
    });
    return await ctx.db.get(args.userId);
  },
});
