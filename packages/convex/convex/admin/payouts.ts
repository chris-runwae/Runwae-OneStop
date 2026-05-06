import { v, ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/admin";
import type { Doc } from "../_generated/dataModel";

const STATUS = v.union(
  v.literal("pending"),
  v.literal("processing"),
  v.literal("paid"),
  v.literal("failed")
);

export const listAll = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(STATUS),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const result = await ctx.db
      .query("payouts")
      .order("desc")
      .paginate(args.paginationOpts);

    let page: Doc<"payouts">[] = result.page;
    if (args.status) page = page.filter((p) => p.status === args.status);

    const hostIds = Array.from(new Set(page.map((p) => p.hostId)));
    const hosts = await Promise.all(hostIds.map((id) => ctx.db.get(id)));
    const hostById = new Map(
      hosts
        .filter((h): h is Doc<"users"> => Boolean(h))
        .map((h) => [h._id, h])
    );

    return {
      ...result,
      page: page.map((p) => ({
        ...p,
        host: hostById.get(p.hostId)
          ? {
              _id: p.hostId,
              name: hostById.get(p.hostId)!.name ?? null,
              email: hostById.get(p.hostId)!.email ?? null,
            }
          : null,
      })),
    };
  },
});

export const getById = query({
  args: { payoutId: v.id("payouts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.payoutId);
    if (!row) return null;
    const host = await ctx.db.get(row.hostId);
    const commissions = await Promise.all(
      row.commissionIds.map((id) => ctx.db.get(id))
    );
    return {
      ...row,
      host: host
        ? { _id: host._id, name: host.name ?? null, email: host.email ?? null }
        : null,
      commissions: commissions.filter(
        (c): c is Doc<"commissions"> => c !== null
      ),
    };
  },
});

// Admin transitions a host-requested payout into processing (Stripe transfer
// kicked off externally). The actual Stripe call belongs in a separate action
// — this mutation just flips state.
export const markProcessing = mutation({
  args: {
    payoutId: v.id("payouts"),
    stripeTransferId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.payoutId);
    if (!row) throw new ConvexError("Payout not found");
    if (row.status !== "pending") {
      throw new ConvexError(
        `Cannot mark processing — payout is "${row.status}"`
      );
    }
    await ctx.db.patch(args.payoutId, {
      status: "processing",
      stripeTransferId: args.stripeTransferId,
    });
    return await ctx.db.get(args.payoutId);
  },
});

// Stripe webhook (or manual confirmation) reports the transfer landed.
// Atomically flips every linked commission "held" → "paid".
export const markPaid = mutation({
  args: {
    payoutId: v.id("payouts"),
    stripeTransferId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.payoutId);
    if (!row) throw new ConvexError("Payout not found");
    if (row.status === "paid") return row;
    if (row.status === "failed") {
      throw new ConvexError("Cannot mark a failed payout as paid");
    }

    for (const cid of row.commissionIds) {
      const c = await ctx.db.get(cid);
      if (c && c.status !== "paid") {
        await ctx.db.patch(cid, { status: "paid" });
      }
    }
    await ctx.db.patch(args.payoutId, {
      status: "paid",
      stripeTransferId: args.stripeTransferId ?? row.stripeTransferId,
    });
    return await ctx.db.get(args.payoutId);
  },
});

// Reverses the held → pending transition the host's request created, so
// commissions are eligible for a future request once the failure is resolved.
export const markFailed = mutation({
  args: {
    payoutId: v.id("payouts"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.payoutId);
    if (!row) throw new ConvexError("Payout not found");
    if (row.status === "paid") {
      throw new ConvexError("Cannot fail an already-paid payout");
    }

    for (const cid of row.commissionIds) {
      const c = await ctx.db.get(cid);
      if (c && c.status === "held") {
        await ctx.db.patch(cid, { status: "pending" });
      }
    }
    await ctx.db.patch(args.payoutId, { status: "failed" });
    return await ctx.db.get(args.payoutId);
  },
});
