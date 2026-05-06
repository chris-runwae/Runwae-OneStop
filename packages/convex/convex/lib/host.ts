import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "../_generated/server";

export async function requireHost(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Unauthorized");
  const user = await ctx.db.get(userId);
  if (!user || user.isHost !== true) throw new ConvexError("Forbidden");
  if (user.suspendedAt !== undefined) {
    throw new ConvexError("Account suspended");
  }
  return user;
}
