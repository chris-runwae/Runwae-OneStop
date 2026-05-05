import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "../_generated/server";

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Unauthorized");
  const user = await ctx.db.get(userId);
  if (!user || !user.isAdmin) throw new ConvexError("Forbidden");
  return user;
}

// Counts users with isAdmin === true. Backed by the by_admin index so this
// is cheap even at scale. Used by the last-admin demotion guard.
export async function countAdmins(
  ctx: QueryCtx | MutationCtx
): Promise<number> {
  const admins = await ctx.db
    .query("users")
    .withIndex("by_admin", (q) => q.eq("isAdmin", true))
    .collect();
  return admins.length;
}
