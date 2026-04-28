import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../convex/schema";
import { api } from "../convex/_generated/api";

const modules = import.meta.glob("../convex/**/*.*s");

describe("polls.createForSavedItem", () => {
  it("creates a poll with options anchored to saved items by id", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(c => c.db.insert("users", { email: "u@x.com", name: "U" }));
    const tripId = await t.run(c => c.db.insert("trips", {
      title: "T", creatorId: userId, startDate: "2026-01-01", endDate: "2026-01-02",
      visibility: "private", status: "planning", slug: "tc3", joinCode: "j",
      currency: "GBP", createdAt: 0, updatedAt: 0,
    }));
    await t.run(c => c.db.insert("trip_members", {
      tripId, userId, role: "owner", status: "accepted", joinedAt: 0,
    }));
    const a = await t.run(c => c.db.insert("saved_items", {
      tripId, addedByUserId: userId, type: "restaurant", title: "Alpha",
      addedToItinerary: false, isManual: true, createdAt: 0,
    }));
    const b = await t.run(c => c.db.insert("saved_items", {
      tripId, addedByUserId: userId, type: "restaurant", title: "Bravo",
      addedToItinerary: false, isManual: true, createdAt: 0,
    }));
    const asUser = t.withIdentity({ subject: userId, email: "u@x.com" });
    const pollId = await asUser.mutation(api.polls.createForSavedItem, {
      tripId, title: "Where to eat?", type: "single_choice", savedItemIds: [a, b],
    });
    const polls = await asUser.query(api.polls.getByTrip, { tripId });
    expect(polls).toHaveLength(1);
    expect(polls[0]._id).toBe(pollId);
    const labels = polls[0].options.map(o => o.label).sort();
    expect(labels).toEqual(["Alpha", "Bravo"]);
    // each option should have savedItemId set
    const allHaveSavedId = polls[0].options.every(o => !!o.savedItemId);
    expect(allHaveSavedId).toBe(true);
  });

  it("rejects fewer than 2 saved items", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(c => c.db.insert("users", { email: "u@x.com", name: "U" }));
    const tripId = await t.run(c => c.db.insert("trips", {
      title: "T", creatorId: userId, startDate: "2026-01-01", endDate: "2026-01-02",
      visibility: "private", status: "planning", slug: "tc3b", joinCode: "j",
      currency: "GBP", createdAt: 0, updatedAt: 0,
    }));
    await t.run(c => c.db.insert("trip_members", {
      tripId, userId, role: "owner", status: "accepted", joinedAt: 0,
    }));
    const a = await t.run(c => c.db.insert("saved_items", {
      tripId, addedByUserId: userId, type: "restaurant", title: "Alpha",
      addedToItinerary: false, isManual: true, createdAt: 0,
    }));
    const asUser = t.withIdentity({ subject: userId, email: "u@x.com" });
    await expect(
      asUser.mutation(api.polls.createForSavedItem, {
        tripId, title: "X", type: "single_choice", savedItemIds: [a],
      })
    ).rejects.toThrow();
  });

  it("ignores saved items belonging to a different trip", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(c => c.db.insert("users", { email: "u@x.com", name: "U" }));
    const tripA = await t.run(c => c.db.insert("trips", {
      title: "A", creatorId: userId, startDate: "2026-01-01", endDate: "2026-01-02",
      visibility: "private", status: "planning", slug: "tcA", joinCode: "a",
      currency: "GBP", createdAt: 0, updatedAt: 0,
    }));
    const tripB = await t.run(c => c.db.insert("trips", {
      title: "B", creatorId: userId, startDate: "2026-01-01", endDate: "2026-01-02",
      visibility: "private", status: "planning", slug: "tcB", joinCode: "b",
      currency: "GBP", createdAt: 0, updatedAt: 0,
    }));
    await t.run(c => c.db.insert("trip_members", {
      tripId: tripA, userId, role: "owner", status: "accepted", joinedAt: 0,
    }));
    const aA = await t.run(c => c.db.insert("saved_items", {
      tripId: tripA, addedByUserId: userId, type: "restaurant", title: "A1",
      addedToItinerary: false, isManual: true, createdAt: 0,
    }));
    const aB = await t.run(c => c.db.insert("saved_items", {
      tripId: tripA, addedByUserId: userId, type: "restaurant", title: "A2",
      addedToItinerary: false, isManual: true, createdAt: 0,
    }));
    const bX = await t.run(c => c.db.insert("saved_items", {
      tripId: tripB, addedByUserId: userId, type: "restaurant", title: "B1",
      addedToItinerary: false, isManual: true, createdAt: 0,
    }));
    const asUser = t.withIdentity({ subject: userId, email: "u@x.com" });
    const pollId = await asUser.mutation(api.polls.createForSavedItem, {
      tripId: tripA, title: "Pick", type: "single_choice", savedItemIds: [aA, aB, bX],
    });
    const polls = await asUser.query(api.polls.getByTrip, { tripId: tripA });
    const labels = polls.find(p => p._id === pollId)?.options.map(o => o.label).sort();
    expect(labels).toEqual(["A1", "A2"]); // bX excluded
  });
});
