import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../convex/schema";
import { api } from "../convex/_generated/api";

const modules = import.meta.glob("../convex/**/*.*s");

async function seedTripWithUser(t: ReturnType<typeof convexTest>) {
  const userId = await t.run(c => c.db.insert("users", { email: "u@x.com", name: "U" }));
  const tripId = await t.run(c => c.db.insert("trips", {
    title: "T", creatorId: userId, startDate: "2026-03-14", endDate: "2026-03-18",
    visibility: "private", status: "planning", slug: "t", joinCode: "j",
    currency: "GBP", createdAt: 0, updatedAt: 0,
  }));
  return { userId, tripId };
}

describe("posts", () => {
  it("getByTrip returns posts in newest-first order with author joined", async () => {
    const t = convexTest(schema, modules);
    const { userId, tripId } = await seedTripWithUser(t);
    await t.run(async (c) => {
      await c.db.insert("trip_posts", { tripId, createdByUserId: userId, content: "first",  createdAt: 1, updatedAt: 1 });
      await c.db.insert("trip_posts", { tripId, createdByUserId: userId, content: "second", createdAt: 2, updatedAt: 2 });
    });
    const posts = await t.query(api.posts.getByTrip, { tripId });
    expect(posts.map(p => p.content)).toEqual(["second", "first"]);
    expect(posts[0].author?.name).toBe("U");
  });

  it("countBySavedItems aggregates by savedItemId", async () => {
    const t = convexTest(schema, modules);
    const { userId, tripId } = await seedTripWithUser(t);
    const savedId = await t.run(c => c.db.insert("saved_items", {
      tripId, addedByUserId: userId, type: "restaurant", title: "Pierchic",
      addedToItinerary: false, isManual: true, createdAt: 0,
    }));
    await t.run(async (c) => {
      await c.db.insert("trip_posts", { tripId, createdByUserId: userId, content: "a", savedItemId: savedId, createdAt: 1, updatedAt: 1 });
      await c.db.insert("trip_posts", { tripId, createdByUserId: userId, content: "b", savedItemId: savedId, createdAt: 2, updatedAt: 2 });
    });
    const counts = await t.query(api.posts.countBySavedItems, { savedItemIds: [savedId] });
    expect(counts[savedId]).toBe(2);
  });
});
