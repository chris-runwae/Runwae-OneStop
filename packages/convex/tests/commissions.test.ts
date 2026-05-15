import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../convex/schema";
import { api, internal } from "../convex/_generated/api";

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

describe("commissions state transitions", () => {
  async function setupRow(opts?: { status?: "pending" | "held" | "paid" }) {
    const t = convexTest(schema, modules);
    const status = opts?.status ?? "pending";
    const { commissionId, hostId, bookingId } = await t.run(async (ctx) => {
      const hostId = await ctx.db.insert("users", {
        email: "host@x.com",
        isHost: true,
      });
      const bookingId = await ctx.db.insert("bookings", {
        userId: hostId,
        type: "hotel",
        apiSource: "liteapi",
        apiRef: "abc",
        grossAmount: 1000,
        currency: "GBP",
        commissionAmount: 100,
        status: "confirmed",
        bookedAt: Date.now(),
      });
      const commissionId = await ctx.db.insert("commissions", {
        bookingId,
        hostId,
        totalCommission: 100,
        runwaeShare: 50,
        hostShare: 50,
        splitPct: 50,
        currency: "GBP",
        status,
        createdAt: Date.now(),
      });
      return { commissionId, hostId, bookingId };
    });
    return { t, commissionId, hostId, bookingId };
  }

  it("markHeld flips pending → held", async () => {
    const { t, commissionId } = await setupRow();
    await t.mutation(internal.commissions.markHeld, { commissionId });
    const row = await t.run((ctx) => ctx.db.get(commissionId));
    expect(row?.status).toBe("held");
    expect(row?.statusUpdatedAt).toBeTypeOf("number");
  });

  it("markHeld is a no-op for already-held rows", async () => {
    const { t, commissionId } = await setupRow({ status: "held" });
    await t.mutation(internal.commissions.markHeld, { commissionId });
    const row = await t.run((ctx) => ctx.db.get(commissionId));
    expect(row?.status).toBe("held");
  });

  it("reverseForBooking flips every commission for that booking", async () => {
    const { t, bookingId } = await setupRow({ status: "paid" });
    await t.mutation(internal.commissions.reverseForBooking, { bookingId });
    const rows = await t.run((ctx) =>
      ctx.db
        .query("commissions")
        .withIndex("by_booking", (q) => q.eq("bookingId", bookingId))
        .collect()
    );
    expect(rows.every((r) => r.status === "reversed")).toBe(true);
  });

  it("markPaidOut requires admin and refuses non-paid statuses", async () => {
    const { t, commissionId, hostId } = await setupRow({ status: "held" });
    // No identity → unauthorized
    await expect(
      t.mutation(api.commissions.markPaidOut, { commissionId }),
    ).rejects.toThrow();

    // Identity but not admin
    const asHost = t.withIdentity({ subject: hostId, email: "host@x.com" });
    await expect(
      asHost.mutation(api.commissions.markPaidOut, { commissionId }),
    ).rejects.toThrow();

    // Make user admin
    await t.run((ctx) => ctx.db.patch(hostId, { isAdmin: true }));
    const asAdmin = t.withIdentity({ subject: hostId, email: "host@x.com" });
    // Wrong status — refused
    await expect(
      asAdmin.mutation(api.commissions.markPaidOut, { commissionId }),
    ).rejects.toThrow(/Can only mark paid_out/);

    // Move to paid and try again
    await t.run((ctx) => ctx.db.patch(commissionId, { status: "paid" }));
    await asAdmin.mutation(api.commissions.markPaidOut, { commissionId });
    const row = await t.run((ctx) => ctx.db.get(commissionId));
    expect(row?.status).toBe("paid_out");
  });
});
