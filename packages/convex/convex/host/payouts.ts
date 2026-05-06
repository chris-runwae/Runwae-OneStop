import { v, ConvexError } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireHost } from "../lib/host";
import type { Id } from "../_generated/dataModel";

const MIN_PAYOUT_AMOUNT = 10; // floor in the host's earning currency

export const listMyPayouts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const host = await requireHost(ctx);
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("payouts")
      .withIndex("by_host", (q) => q.eq("hostId", host._id))
      .order("desc")
      .take(limit);
  },
});

export const requestPayout = mutation({
  args: {},
  handler: async (ctx) => {
    const host = await requireHost(ctx);

    // Aggregate every commission for this host that is still pending. The
    // payout row references each one explicitly so the admin batch-approve
    // path can flip them to "paid" atomically when the Stripe transfer lands.
    const pending = await ctx.db
      .query("commissions")
      .withIndex("by_host", (q) => q.eq("hostId", host._id))
      .collect();

    const eligible = pending.filter((c) => c.status === "pending");
    if (eligible.length === 0) {
      throw new ConvexError("No pending earnings to pay out.");
    }

    // Single-currency assumption: the schema stores per-commission currency,
    // but Stripe transfers happen in one currency at a time. If a host has
    // mixed-currency commissions we group them and only request the largest
    // bucket — the rest carries to a future request.
    const buckets = new Map<string, typeof eligible>();
    for (const c of eligible) {
      const list = buckets.get(c.currency) ?? [];
      list.push(c);
      buckets.set(c.currency, list);
    }
    const [primaryCurrency, primaryRows] = [...buckets.entries()].sort(
      (a, b) =>
        b[1].reduce((s, c) => s + c.hostShare, 0) -
        a[1].reduce((s, c) => s + c.hostShare, 0)
    )[0];

    const amount = primaryRows.reduce((s, c) => s + c.hostShare, 0);
    if (amount < MIN_PAYOUT_AMOUNT) {
      throw new ConvexError(
        `Minimum payout is ${MIN_PAYOUT_AMOUNT} ${primaryCurrency}. ` +
          `Current balance: ${amount.toFixed(2)} ${primaryCurrency}.`
      );
    }

    // Move commissions to "held" so a second concurrent request can't claim
    // them. Admin approval flips held → paid; rejection flips back to pending.
    const commissionIds: Id<"commissions">[] = [];
    for (const c of primaryRows) {
      await ctx.db.patch(c._id, { status: "held" });
      commissionIds.push(c._id);
    }

    const now = Date.now();
    const periodStart = primaryRows.reduce(
      (m, c) => Math.min(m, c.createdAt),
      now
    );
    const payoutId = await ctx.db.insert("payouts", {
      hostId: host._id,
      amount,
      currency: primaryCurrency,
      status: "pending",
      periodStart,
      periodEnd: now,
      commissionIds,
      createdAt: now,
    });

    return await ctx.db.get(payoutId);
  },
});
