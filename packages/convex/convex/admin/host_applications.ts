import { v, ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/admin";
import type { Doc } from "../_generated/dataModel";

export const listPending = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const result = await ctx.db
      .query("host_applications")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .paginate(args.paginationOpts);

    const userIds = Array.from(new Set(result.page.map((a) => a.userId)));
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    const userById = new Map(
      users
        .filter((u): u is Doc<"users"> => Boolean(u))
        .map((u) => [u._id, u])
    );

    return {
      ...result,
      page: result.page.map((a) => ({
        ...a,
        applicant: userById.get(a.userId)
          ? {
              _id: a.userId,
              name: userById.get(a.userId)!.name ?? null,
              email: userById.get(a.userId)!.email ?? null,
              image: userById.get(a.userId)!.image ?? null,
            }
          : null,
      })),
    };
  },
});

export const getApplication = query({
  args: { applicationId: v.id("host_applications") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const app = await ctx.db.get(args.applicationId);
    if (!app) return null;
    const user = await ctx.db.get(app.userId);
    return {
      application: app,
      applicant: user
        ? {
            _id: user._id,
            name: user.name ?? null,
            email: user.email ?? null,
            image: user.image ?? null,
          }
        : null,
    };
  },
});

export const approve = mutation({
  args: { applicationId: v.id("host_applications") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new ConvexError("Application not found");
    if (app.status !== "pending") {
      throw new ConvexError(`Application is already "${app.status}"`);
    }
    const now = Date.now();
    await ctx.db.patch(args.applicationId, {
      status: "approved",
      reviewedByAdminId: admin._id,
      updatedAt: now,
    });
    await ctx.db.patch(app.userId, { isHost: true });
    return await ctx.db.get(args.applicationId);
  },
});

export const reject = mutation({
  args: {
    applicationId: v.id("host_applications"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new ConvexError("Application not found");
    if (app.status !== "pending") {
      throw new ConvexError(`Application is already "${app.status}"`);
    }
    const trimmed = args.reason?.trim();
    await ctx.db.patch(args.applicationId, {
      status: "rejected",
      reviewedByAdminId: admin._id,
      rejectionReason: trimmed && trimmed.length > 0 ? trimmed : undefined,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.applicationId);
  },
});
