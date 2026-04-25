import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";

export const getExchangeRates = query({
  args: { baseCurrency: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const base = args.baseCurrency ?? "GBP";
    return await ctx.db
      .query("exchange_rates")
      .withIndex("by_base", (q) => q.eq("baseCurrency", base))
      .order("desc")
      .first();
  },
});

export const writeRates = internalMutation({
  args: {
    baseCurrency: v.string(),
    rates: v.any(),
    fetchedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("exchange_rates", {
      baseCurrency: args.baseCurrency,
      rates: args.rates,
      fetchedAt: args.fetchedAt,
    });
  },
});

export const refreshRates = internalAction({
  args: { baseCurrency: v.optional(v.string()) },
  handler: async (ctx, args): Promise<{ base: string; fetchedAt: number }> => {
    const base = args.baseCurrency ?? "GBP";
    const url = `https://api.frankfurter.app/latest?from=${base}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Frankfurter returned ${res.status}`);
    }
    const json = (await res.json()) as {
      amount: number;
      base: string;
      date: string;
      rates: Record<string, number>;
    };
    const fetchedAt = Date.now();
    await ctx.runMutation(internal.currency.writeRates, {
      baseCurrency: json.base,
      rates: json.rates,
      fetchedAt,
    });
    return { base: json.base, fetchedAt };
  },
});
