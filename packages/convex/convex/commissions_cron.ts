import { v } from "convex/values";
import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Finds commissions that should transition pending → held and processes
 * them. "Held" means the guest has checked out (hotels) or flown (last
 * flight segment departed). Sets a sane cap per tick to stay under
 * transaction limits — re-runs picks up the rest.
 */
export const runPendingToHeld = internalAction({
  args: {},
  handler: async (ctx): Promise<{ flipped: number }> => {
    const candidates = await ctx.runQuery(
      internal.commissions_cron.listEligibleForHeld,
      { now: Date.now(), limit: 200 },
    );
    let flipped = 0;
    for (const id of candidates) {
      try {
        await ctx.runMutation(internal.commissions.markHeld, {
          commissionId: id,
        });
        flipped++;
      } catch (err) {
        console.error("[commissions_cron] markHeld failed", id, err);
      }
    }
    return { flipped };
  },
});

export const listEligibleForHeld = internalQuery({
  args: { now: v.number(), limit: v.number() },
  handler: async (ctx, { now, limit }): Promise<Id<"commissions">[]> => {
    const pending = await ctx.db
      .query("commissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(limit);

    const eligible: Id<"commissions">[] = [];
    for (const c of pending) {
      const booking = (await ctx.db.get(c.bookingId)) as
        | Doc<"bookings">
        | null;
      if (!booking) continue;
      // For hotels, rawResponse.checkout is an ISO date string (YYYY-MM-DD).
      // For flights, we don't have an authoritative "flown" timestamp on
      // the booking; conservatively use bookedAt + 14 days as a proxy, the
      // typical maximum window between booking and travel that's safe to
      // treat as "guest has flown" without a Duffel webhook integration.
      let flownAt: number | null = null;
      if (booking.type === "hotel") {
        const checkout = booking.rawResponse?.checkout as string | undefined;
        if (checkout) {
          const t = Date.parse(checkout);
          if (Number.isFinite(t)) flownAt = t;
        }
      } else if (booking.type === "flight") {
        flownAt = booking.bookedAt + 14 * 24 * 60 * 60 * 1000;
      } else if (booking.type === "event_ticket") {
        const event = booking.eventId ? await ctx.db.get(booking.eventId) : null;
        flownAt =
          (event?.endDateUtc as number | undefined) ??
          (event?.startDateUtc as number | undefined) ??
          null;
      }
      if (flownAt !== null && flownAt <= now) {
        eligible.push(c._id);
      }
    }
    return eligible;
  },
});
