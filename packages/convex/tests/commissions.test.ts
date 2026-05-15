import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../convex/schema";
import { internal } from "../convex/_generated/api";

const modules = import.meta.glob("../convex/**/*.*s");

// recordForBooking interprets `hostSharePct` as the host's slice of
// `totalCommission` — a whole-number percent in [0, 100]. The original
// implementation took an arg called `splitPct` which was ambiguous with the
// platform-commission-rate semantics used by the direct inserts in
// bookings.ts; these tests lock the host-share-percent semantics in place.
describe("commissions.recordForBooking", () => {
  async function setup() {
    const t = convexTest(schema, modules);
    const bookingId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", { email: "host@x.com" });
      return await ctx.db.insert("bookings", {
        userId,
        type: "event_ticket",
        apiSource: "internal",
        apiRef: "test",
        grossAmount: 10_000,
        currency: "GBP",
        commissionAmount: 1_000,
        status: "confirmed",
        bookedAt: Date.now(),
      });
    });
    return { t, bookingId };
  }

  it("splits totalCommission by hostSharePct (70/30)", async () => {
    const { t, bookingId } = await setup();
    const commissionId = await t.mutation(
      internal.commissions.recordForBooking,
      {
        bookingId,
        totalCommission: 1_000,
        hostSharePct: 70,
        currency: "GBP",
      }
    );
    const row = await t.run((ctx) => ctx.db.get(commissionId));
    expect(row?.hostShare).toBe(700);
    expect(row?.runwaeShare).toBe(300);
    expect(row?.totalCommission).toBe(1_000);
    expect(row?.splitPct).toBe(70);
  });

  it("rounds at the .5 boundary using Math.round", async () => {
    const { t, bookingId } = await setup();
    const commissionId = await t.mutation(
      internal.commissions.recordForBooking,
      {
        bookingId,
        totalCommission: 1,
        hostSharePct: 50,
        currency: "GBP",
      }
    );
    const row = await t.run((ctx) => ctx.db.get(commissionId));
    expect(row?.hostShare).toBe(1);
    expect(row?.runwaeShare).toBe(0);
  });

  it("hostSharePct=0 means Runwae keeps 100%", async () => {
    const { t, bookingId } = await setup();
    const commissionId = await t.mutation(
      internal.commissions.recordForBooking,
      {
        bookingId,
        totalCommission: 1_000,
        hostSharePct: 0,
        currency: "GBP",
      }
    );
    const row = await t.run((ctx) => ctx.db.get(commissionId));
    expect(row?.hostShare).toBe(0);
    expect(row?.runwaeShare).toBe(1_000);
  });

  it("hostSharePct=100 means host gets 100%", async () => {
    const { t, bookingId } = await setup();
    const commissionId = await t.mutation(
      internal.commissions.recordForBooking,
      {
        bookingId,
        totalCommission: 1_000,
        hostSharePct: 100,
        currency: "GBP",
      }
    );
    const row = await t.run((ctx) => ctx.db.get(commissionId));
    expect(row?.hostShare).toBe(1_000);
    expect(row?.runwaeShare).toBe(0);
  });

  it("throws on hostSharePct out of range", async () => {
    const { t, bookingId } = await setup();
    await expect(
      t.mutation(internal.commissions.recordForBooking, {
        bookingId,
        totalCommission: 1_000,
        hostSharePct: 150,
        currency: "GBP",
      })
    ).rejects.toThrow(/hostSharePct must be in/);
    await expect(
      t.mutation(internal.commissions.recordForBooking, {
        bookingId,
        totalCommission: 1_000,
        hostSharePct: -10,
        currency: "GBP",
      })
    ).rejects.toThrow(/hostSharePct must be in/);
  });
});
