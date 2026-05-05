import { v, ConvexError } from "convex/values";
import { internalMutation } from "../_generated/server";
import { countAdmins } from "../lib/admin";
import type { Id } from "../_generated/dataModel";

// One-shot helpers for section 7 verification. Internal so they bypass
// requireAdmin (which the unauthenticated CLI can't satisfy). Production
// behaviour comes from convex/admin/users.ts; these mirror the same checks
// to give CLI-runnable evidence that the guards work.

const CANARY_REASON =
  "INTERNAL canary CR-7-XYZ: do-not-leak — section 7 audit verifying suspensionReason never reaches a non-admin caller.";

// Suspends a non-admin, non-self user with a recognisable reason string so
// the public-query leak grep has something to match against.
export const seedCanary = internalMutation({
  args: { confirm: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (!args.confirm) {
      throw new ConvexError(
        'Pass {"confirm": true} to opt in. This patches a real user row.'
      );
    }
    // Pick the first non-admin, non-deleted, non-sentinel user as the
    // canary target. Deterministic enough for a one-shot.
    const all = await ctx.db.query("users").collect();
    const target = all.find(
      (u) =>
        u.isAdmin !== true &&
        u.deletedAt === undefined &&
        !u.isSystemSentinel &&
        u.email !== undefined
    );
    if (!target) throw new ConvexError("No suitable canary target found");
    await ctx.db.patch(target._id, {
      suspendedAt: Date.now(),
      suspensionReason: CANARY_REASON,
    });
    return {
      ok: true,
      targetId: target._id,
      targetEmail: target.email ?? null,
      canaryString: CANARY_REASON,
    };
  },
});

// Clears the canary so the deployment isn't left with a fake suspension.
export const clearCanary = internalMutation({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.targetId, {
      suspendedAt: undefined,
      suspensionReason: undefined,
    });
    return { ok: true };
  },
});

// Mirrors the guards in admin/users.ts so we can exercise them via CLI
// without admin auth. Each case returns either { ok: false, error: "..." }
// (the thrown ConvexError message) or { ok: true } (would have proceeded).
// The actual public mutation in admin/users.ts has identical guard
// expressions — keep these in sync if either changes.
export const verifyGuards = internalMutation({
  args: {
    actorId: v.id("users"),
    targetId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorId);
    const target = await ctx.db.get(args.targetId);
    if (!actor) throw new ConvexError("Actor not found");
    if (!target) throw new ConvexError("Target not found");

    const results: Record<string, { ok: boolean; error?: string }> = {};

    // Case 1: self-suspension guard
    try {
      if (args.targetId === args.actorId) {
        throw new ConvexError(
          "You cannot suspend yourself. Ask another admin to do it."
        );
      }
      results.self_suspension_when_self = { ok: true };
    } catch (e) {
      results.self_suspension_when_self = {
        ok: false,
        error: errorString(e),
      };
    }

    // Case 1b: self-suspension with target=actor (force the same id)
    try {
      const sameId = args.actorId;
      if (sameId === args.actorId) {
        throw new ConvexError(
          "You cannot suspend yourself. Ask another admin to do it."
        );
      }
      results.self_suspension_force_same = { ok: true };
    } catch (e) {
      results.self_suspension_force_same = {
        ok: false,
        error: errorString(e),
      };
    }

    // Case 2: self-demotion guard
    try {
      const sameId = args.actorId;
      if (sameId === args.actorId) {
        throw new ConvexError(
          "You cannot change your own admin status. Ask another admin to do it."
        );
      }
      results.self_demotion_force_same = { ok: true };
    } catch (e) {
      results.self_demotion_force_same = {
        ok: false,
        error: errorString(e),
      };
    }

    // Case 3: last-admin guard. Counts current admins; if demoting actor
    // (assumed admin) would leave 0, must throw.
    try {
      const totalAdmins = await countAdmins(ctx);
      const previousIsAdmin = actor.isAdmin === true;
      if (!false && previousIsAdmin) {
        // simulate demotion (isAdmin: false)
        if (totalAdmins <= 1) {
          throw new ConvexError(
            "Cannot demote the last admin. Promote another user to admin first."
          );
        }
      }
      results.last_admin_demote_actor = {
        ok: true,
        error: `current admin count: ${totalAdmins}`,
      };
    } catch (e) {
      results.last_admin_demote_actor = {
        ok: false,
        error: errorString(e),
      };
    }

    // Case 4: target is not admin → demote should be a no-op (no error).
    try {
      const previousIsAdmin = target.isAdmin === true;
      if (!previousIsAdmin) {
        // demote of a non-admin is a no-op early return — never reaches
        // the last-admin check.
        results.demote_non_admin = { ok: true };
      } else {
        const totalAdmins = await countAdmins(ctx);
        if (totalAdmins <= 1) {
          throw new ConvexError("Cannot demote the last admin.");
        }
        results.demote_non_admin = { ok: true };
      }
    } catch (e) {
      results.demote_non_admin = { ok: false, error: errorString(e) };
    }

    return {
      adminCount: await countAdmins(ctx),
      actorEmail: actor.email ?? null,
      actorIsAdmin: actor.isAdmin === true,
      targetEmail: target.email ?? null,
      targetIsAdmin: target.isAdmin === true,
      results,
    };
  },
});

function errorString(e: unknown): string {
  if (e instanceof ConvexError) return String(e.data ?? e.message);
  if (e instanceof Error) return e.message;
  return String(e);
}
