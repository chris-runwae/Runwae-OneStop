import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../convex/schema";
import { api } from "../convex/_generated/api";

const modules = import.meta.glob("../convex/**/*.*s");

async function seed(t: ReturnType<typeof convexTest>) {
  const userId = await t.run(c => c.db.insert("users", { email: "u@x.com", name: "U" }));
  const tripId = await t.run(c => c.db.insert("trips", {
    title: "T", creatorId: userId, startDate: "2026-03-14", endDate: "2026-03-18",
    visibility: "private", status: "planning", slug: "t", joinCode: "j",
    currency: "GBP", createdAt: 0, updatedAt: 0,
  }));
  const pollId = await t.run(c => c.db.insert("trip_polls", {
    tripId, createdByUserId: userId, title: "Where to eat?",
    type: "single_choice", status: "open", allowAddOptions: false,
    isAnonymous: false, createdAt: 0,
  }));
  const optA = await t.run(c => c.db.insert("poll_options", { pollId, label: "A", addedByUserId: userId, createdAt: 0 }));
  const optB = await t.run(c => c.db.insert("poll_options", { pollId, label: "B", addedByUserId: userId, createdAt: 0 }));
  return { userId, tripId, pollId, optA, optB };
}

describe("polls", () => {
  it("getByTrip returns each poll with options + vote counts", async () => {
    const t = convexTest(schema, modules);
    const { tripId, optA, userId, pollId } = await seed(t);
    await t.run(c => c.db.insert("poll_votes", { pollId, optionId: optA, userId, createdAt: 0 }));
    const polls = await t.query(api.polls.getByTrip, { tripId });
    expect(polls).toHaveLength(1);
    expect(polls[0].totalVotes).toBe(1);
    expect(polls[0].options.find(o => o._id === optA)?.voteCount).toBe(1);
  });

  it("vote is idempotent: re-voting same option does not duplicate", async () => {
    const t = convexTest(schema, modules);
    const { pollId, optA, userId } = await seed(t);
    const asUser = t.withIdentity({ subject: userId, email: "u@x.com" });
    await asUser.mutation(api.polls.vote, { pollId, optionId: optA });
    await asUser.mutation(api.polls.vote, { pollId, optionId: optA });
    const votes = await t.run(c =>
      c.db.query("poll_votes").withIndex("by_poll", q => q.eq("pollId", pollId)).collect()
    );
    expect(votes).toHaveLength(1);
  });

  it("vote on a different option in single_choice replaces the previous vote", async () => {
    const t = convexTest(schema, modules);
    const { pollId, optA, optB, userId } = await seed(t);
    const asUser = t.withIdentity({ subject: userId, email: "u@x.com" });
    await asUser.mutation(api.polls.vote, { pollId, optionId: optA });
    await asUser.mutation(api.polls.vote, { pollId, optionId: optB });
    const votes = await t.run(c =>
      c.db.query("poll_votes").withIndex("by_poll", q => q.eq("pollId", pollId)).collect()
    );
    expect(votes).toHaveLength(1);
    expect(votes[0].optionId).toBe(optB);
  });
});
