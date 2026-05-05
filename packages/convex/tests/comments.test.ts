import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../convex/schema";
import { api } from "../convex/_generated/api";

const modules = import.meta.glob("../convex/**/*.*s");

async function seed(t: ReturnType<typeof convexTest>) {
  const ownerId = await t.run(c => c.db.insert("users", { email: "o@x.com", name: "O" }));
  const tripId = await t.run(c => c.db.insert("trips", {
    title: "T", creatorId: ownerId, startDate: "2026-01-01", endDate: "2026-01-02",
    visibility: "private", status: "planning", slug: "tc2", joinCode: "j",
    currency: "GBP", createdAt: 0, updatedAt: 0,
  }));
  await t.run(c => c.db.insert("trip_members", {
    tripId, userId: ownerId, role: "owner", status: "accepted", joinedAt: 0,
  }));
  const savedId = await t.run(c => c.db.insert("saved_items", {
    tripId, addedByUserId: ownerId, type: "restaurant", title: "X",
    addedToItinerary: false, isManual: true, createdAt: 0,
  }));
  return { ownerId, tripId, savedId };
}

describe("saved_items comments", () => {
  it("addComment + getComments roundtrip with author joined", async () => {
    const t = convexTest(schema, modules);
    const { ownerId, savedId } = await seed(t);
    const asOwner = t.withIdentity({ subject: ownerId, email: "o@x.com" });
    await asOwner.mutation(api.saved_items.addComment, { savedItemId: savedId, content: "  yum  " });
    const list = await asOwner.query(api.saved_items.getComments, { savedItemId: savedId });
    expect(list).toHaveLength(1);
    expect(list[0].content).toBe("yum");
    expect(list[0].author?.name).toBe("O");
  });

  it("rejects empty/whitespace-only comments", async () => {
    const t = convexTest(schema, modules);
    const { ownerId, savedId } = await seed(t);
    const asOwner = t.withIdentity({ subject: ownerId, email: "o@x.com" });
    await expect(
      asOwner.mutation(api.saved_items.addComment, { savedItemId: savedId, content: "   " })
    ).rejects.toThrow();
  });

  it("non-member cannot add a comment", async () => {
    const t = convexTest(schema, modules);
    const { savedId } = await seed(t);
    const intruderId = await t.run(c => c.db.insert("users", { email: "i@x.com", name: "I" }));
    const asIntruder = t.withIdentity({ subject: intruderId, email: "i@x.com" });
    await expect(
      asIntruder.mutation(api.saved_items.addComment, { savedItemId: savedId, content: "hi" })
    ).rejects.toThrow();
  });

  it("removeComment only by author", async () => {
    const t = convexTest(schema, modules);
    const { ownerId, tripId, savedId } = await seed(t);
    const otherMemberId = await t.run(c => c.db.insert("users", { email: "m@x.com", name: "M" }));
    await t.run(c => c.db.insert("trip_members", {
      tripId, userId: otherMemberId, role: "editor", status: "accepted", joinedAt: 0,
    }));
    const asOwner = t.withIdentity({ subject: ownerId, email: "o@x.com" });
    const commentId = await asOwner.mutation(api.saved_items.addComment, { savedItemId: savedId, content: "hi" });
    const asOther = t.withIdentity({ subject: otherMemberId, email: "m@x.com" });
    await expect(
      asOther.mutation(api.saved_items.removeComment, { commentId })
    ).rejects.toThrow();
    await asOwner.mutation(api.saved_items.removeComment, { commentId });
    const list = await asOwner.query(api.saved_items.getComments, { savedItemId: savedId });
    expect(list).toHaveLength(0);
  });
});
