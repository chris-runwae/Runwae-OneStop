import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../convex/schema";
import { api } from "../convex/_generated/api";

const modules = import.meta.glob("../convex/**/*.*s");

describe("members.listByTrip", () => {
  it("returns accepted members joined with user profile", async () => {
    const t = convexTest(schema, modules);
    const userA = await t.run(async (ctx) =>
      ctx.db.insert("users", { email: "a@x.com", name: "Alice" })
    );
    const userB = await t.run(async (ctx) =>
      ctx.db.insert("users", { email: "b@x.com", name: "Bob" })
    );
    const tripId = await t.run(async (ctx) =>
      ctx.db.insert("trips", {
        title: "T", creatorId: userA, startDate: "2026-03-14", endDate: "2026-03-18",
        visibility: "private", status: "planning", slug: "t", joinCode: "j",
        currency: "GBP", createdAt: 0, updatedAt: 0,
      })
    );
    await t.run(async (ctx) => {
      await ctx.db.insert("trip_members", { tripId, userId: userA, role: "owner",  status: "accepted", joinedAt: 0 });
      await ctx.db.insert("trip_members", { tripId, userId: userB, role: "viewer", status: "accepted", joinedAt: 0 });
    });

    const members = await t.query(api.members.listByTrip, { tripId });
    expect(members).toHaveLength(2);
    expect(members.map(m => m.role).sort()).toEqual(["owner", "viewer"]);
    expect(members.find(m => m.role === "owner")?.user?.name).toBe("Alice");
  });

  it("excludes pending and declined members", async () => {
    const t = convexTest(schema, modules);
    const userA = await t.run(async (ctx) =>
      ctx.db.insert("users", { email: "a@x.com", name: "Alice" })
    );
    const tripId = await t.run(async (ctx) =>
      ctx.db.insert("trips", {
        title: "T", creatorId: userA, startDate: "2026-03-14", endDate: "2026-03-18",
        visibility: "private", status: "planning", slug: "t", joinCode: "j",
        currency: "GBP", createdAt: 0, updatedAt: 0,
      })
    );
    await t.run(async (ctx) => {
      await ctx.db.insert("trip_members", { tripId, userId: userA, role: "owner", status: "pending", joinedAt: 0 });
    });
    expect(await t.query(api.members.listByTrip, { tripId })).toEqual([]);
  });
});
