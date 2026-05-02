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

export const getById = query({
  args: { expenseId: v.id("expenses") },
  handler: async (ctx, { expenseId }) => {
    const expense = await ctx.db.get(expenseId);
    if (!expense) return null;
    const splits = await ctx.db
      .query("expense_splits")
      .withIndex("by_expense", (q) => q.eq("expenseId", expenseId))
      .collect();
    return {
      ...expense,
      paidBy: toPublicUserOtherOrNull(await ctx.db.get(expense.paidByUserId)),
      splits: await Promise.all(
        splits.map(async (s) => ({
          ...s,
          user: toPublicUserOtherOrNull(await ctx.db.get(s.userId)),
        })),
      ),
    };
  },
});

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

export const update = mutation({
  args: {
    expenseId: v.id("expenses"),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    category: v.optional(EXPENSE_CATEGORY),
    date: v.optional(v.string()),
    description: v.optional(v.string()),
    receiptImageUrl: v.optional(v.string()),
    splitType: v.optional(SPLIT_TYPE),
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
    const expense = await ctx.db.get(args.expenseId);
    if (!expense) throw new Error("Expense not found");
    if (expense.paidByUserId !== userId) {
      throw new Error("Only the payer can edit this expense");
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const key of [
      "amount",
      "currency",
      "category",
      "date",
      "description",
      "receiptImageUrl",
      "splitType",
    ] as const) {
      const val = (args as any)[key];
      if (val !== undefined) patch[key] = val;
    }
    await ctx.db.patch(args.expenseId, patch);

    // If split-shape changed, re-fan-out the expense_splits rows to
    // match the new participants/amounts. Settlement state on existing
    // splits is preserved when the same participant is still in the
    // new set.
    const reshape =
      args.splitType !== undefined ||
      args.participantIds !== undefined ||
      args.customSplits !== undefined ||
      args.amount !== undefined;
    if (!reshape) return { ok: true };

    const existingSplits = await ctx.db
      .query("expense_splits")
      .withIndex("by_expense", (q) => q.eq("expenseId", args.expenseId))
      .collect();
    const settledMap = new Map(
      existingSplits.map((s) => [s.userId as unknown as string, s.isSettled]),
    );
    for (const s of existingSplits) await ctx.db.delete(s._id);

    const splitType = args.splitType ?? expense.splitType;
    const amount = args.amount ?? expense.amount;
    const currency = args.currency ?? expense.currency;

    if (splitType === "equal") {
      const ids = args.participantIds ?? [];
      const share = ids.length > 0 ? amount / ids.length : 0;
      for (const uid of ids) {
        await ctx.db.insert("expense_splits", {
          expenseId: args.expenseId,
          userId: uid,
          amountOwed: share,
          currency,
          isSettled: settledMap.get(uid as unknown as string) ?? false,
        });
      }
    } else {
      for (const split of args.customSplits ?? []) {
        await ctx.db.insert("expense_splits", {
          expenseId: args.expenseId,
          userId: split.userId,
          amountOwed: split.amountOwed,
          currency,
          isSettled:
            settledMap.get(split.userId as unknown as string) ?? false,
        });
      }
    }
    return { ok: true };
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
