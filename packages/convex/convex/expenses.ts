import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { toPublicUserOtherOrNull } from "./lib/user_sanitize";

const EXPENSE_CATEGORY = v.union(
  v.literal("accommodation"),
  v.literal("transport"),
  v.literal("food"),
  v.literal("activity"),
  v.literal("shopping"),
  v.literal("other"),
);

const SPLIT_TYPE = v.union(v.literal("equal"), v.literal("custom"));

async function assertTripMember(
  ctx: { db: any; auth: any },
  tripId: Id<"trips">,
  userId: Id<"users">,
) {
  const membership = await ctx.db
    .query("trip_members")
    .withIndex("by_trip", (q: any) => q.eq("tripId", tripId))
    .filter((q: any) => q.eq(q.field("userId"), userId))
    .first();
  if (!membership) throw new Error("Not a member of this trip");
  return membership;
}

export const getByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const trip = await ctx.db.get(tripId);
    if (!trip) return [];
    if (trip.visibility !== "public") {
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("tripId", tripId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();
      if (!membership) return [];
    }

    const rows = await ctx.db
      .query("expenses")
      .withIndex("by_trip", (q) => q.eq("tripId", tripId))
      .order("desc")
      .collect();

    return Promise.all(
      rows.map(async (e) => {
        const splits = await ctx.db
          .query("expense_splits")
          .withIndex("by_expense", (q) => q.eq("expenseId", e._id))
          .collect();
        return {
          ...e,
          paidBy: toPublicUserOtherOrNull(await ctx.db.get(e.paidByUserId)),
          splits: await Promise.all(
            splits.map(async (s) => ({
              ...s,
              user: toPublicUserOtherOrNull(await ctx.db.get(s.userId)),
            })),
          ),
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    tripId: v.id("trips"),
    amount: v.number(),
    currency: v.string(),
    category: EXPENSE_CATEGORY,
    date: v.string(),
    description: v.optional(v.string()),
    splitType: SPLIT_TYPE,
    receiptImageUrl: v.optional(v.string()),
    // For "equal" splits the server fans out across these participants.
    // For "custom" splits each pair (userId, amountOwed) is required.
    participantIds: v.optional(v.array(v.id("users"))),
    customSplits: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          amountOwed: v.number(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    await assertTripMember(ctx, args.tripId, userId);

    const now = Date.now();
    const expenseId = await ctx.db.insert("expenses", {
      tripId: args.tripId,
      paidByUserId: userId,
      amount: args.amount,
      currency: args.currency,
      category: args.category,
      date: args.date,
      description: args.description,
      splitType: args.splitType,
      receiptImageUrl: args.receiptImageUrl,
      createdAt: now,
      updatedAt: now,
    });

    if (args.splitType === "equal") {
      const ids = args.participantIds ?? [];
      if (ids.length === 0) {
        // Fall back to "the entire trip's members" when callers don't
        // supply an explicit list.
        const members = await ctx.db
          .query("trip_members")
          .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
          .filter((q) => q.eq(q.field("status"), "accepted"))
          .collect();
        for (const m of members) ids.push(m.userId);
      }
      const share = ids.length > 0 ? args.amount / ids.length : 0;
      for (const uid of ids) {
        await ctx.db.insert("expense_splits", {
          expenseId,
          userId: uid,
          amountOwed: share,
          currency: args.currency,
          isSettled: uid === userId,
        });
      }
    } else {
      for (const split of args.customSplits ?? []) {
        await ctx.db.insert("expense_splits", {
          expenseId,
          userId: split.userId,
          amountOwed: split.amountOwed,
          currency: args.currency,
          isSettled: split.userId === userId,
        });
      }
    }
    return expenseId;
  },
});

export const remove = mutation({
  args: { expenseId: v.id("expenses") },
  handler: async (ctx, { expenseId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const expense = await ctx.db.get(expenseId);
    if (!expense) return { ok: true };
    if (expense.paidByUserId !== userId) {
      throw new Error("Only the payer can delete this expense.");
    }
    const splits = await ctx.db
      .query("expense_splits")
      .withIndex("by_expense", (q) => q.eq("expenseId", expenseId))
      .collect();
    for (const s of splits) await ctx.db.delete(s._id);
    await ctx.db.delete(expenseId);
    return { ok: true };
  },
});

export const settleSplit = mutation({
  args: { splitId: v.id("expense_splits"), isSettled: v.boolean() },
  handler: async (ctx, { splitId, isSettled }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const split = await ctx.db.get(splitId);
    if (!split) throw new Error("Split not found");
    if (split.userId !== userId) {
      // The payer can also flip a split to settled when they receive
      // payment outside the app — keep the access door for them.
      const expense = await ctx.db.get(split.expenseId);
      if (!expense || expense.paidByUserId !== userId) {
        throw new Error("Cannot modify someone else's split");
      }
    }
    await ctx.db.patch(splitId, {
      isSettled,
      settledAt: isSettled ? Date.now() : undefined,
    });
    return { ok: true };
  },
});
