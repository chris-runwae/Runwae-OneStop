import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../convex/schema";
import { api } from "../convex/_generated/api";

const modules = import.meta.glob("../convex/**/*.*s");

describe("completeOnboarding", () => {
  it("throws when not authenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.users.completeOnboarding, {})
    ).rejects.toThrow("Not authenticated");
  });

  it("sets onboardingComplete to true on the current user", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { email: "alice@x.com", name: "Alice" })
    );
    const asUser = t.withIdentity({ subject: userId, email: "alice@x.com" });
    const result = await asUser.mutation(api.users.completeOnboarding, {});
    expect(result?.onboardingComplete).toBe(true);
  });

  it("getCurrentUser reflects onboardingComplete after mutation", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { email: "bob@x.com", name: "Bob" })
    );
    const asUser = t.withIdentity({ subject: userId, email: "bob@x.com" });
    await asUser.mutation(api.users.completeOnboarding, {});
    const user = await asUser.query(api.users.getCurrentUser, {});
    expect(user?.onboardingComplete).toBe(true);
  });
});

describe("usernames", () => {
  it("isUsernameAvailable rejects invalid format", async () => {
    const t = convexTest(schema, modules);
    const r = await t.query(api.users.isUsernameAvailable, { username: "ab" });
    expect(r.available).toBe(false);
  });

  it("isUsernameAvailable returns true for a free username", async () => {
    const t = convexTest(schema, modules);
    const r = await t.query(api.users.isUsernameAvailable, { username: "freebird" });
    expect(r.available).toBe(true);
  });

  it("isUsernameAvailable returns false when taken by another user", async () => {
    const t = convexTest(schema, modules);
    await t.run((c) =>
      c.db.insert("users", { email: "a@x.com", name: "A", username: "alpha1" })
    );
    const r = await t.query(api.users.isUsernameAvailable, { username: "alpha1" });
    expect(r.available).toBe(false);
  });

  it("setUsername persists and rejects duplicates", async () => {
    const t = convexTest(schema, modules);
    const meId = await t.run((c) =>
      c.db.insert("users", { email: "me@x.com", name: "Me" })
    );
    const otherId = await t.run((c) =>
      c.db.insert("users", { email: "other@x.com", name: "Other", username: "taken1" })
    );
    void otherId;
    const asMe = t.withIdentity({ subject: meId, email: "me@x.com" });
    const updated = await asMe.mutation(api.users.setUsername, { username: "Mine_01" });
    expect(updated?.username).toBe("mine_01");
    await expect(
      asMe.mutation(api.users.setUsername, { username: "taken1" })
    ).rejects.toThrow("already taken");
  });

  it("setUsername rejects reserved words", async () => {
    const t = convexTest(schema, modules);
    const meId = await t.run((c) =>
      c.db.insert("users", { email: "me@x.com", name: "Me" })
    );
    const asMe = t.withIdentity({ subject: meId, email: "me@x.com" });
    await expect(
      asMe.mutation(api.users.setUsername, { username: "admin" })
    ).rejects.toThrow();
  });

  it("searchByUsername prefix-matches and excludes the caller", async () => {
    const t = convexTest(schema, modules);
    const meId = await t.run((c) =>
      c.db.insert("users", { email: "me@x.com", name: "Me", username: "alex_me" })
    );
    await t.run((c) =>
      c.db.insert("users", { email: "a@x.com", name: "Alice", username: "alex01" })
    );
    await t.run((c) =>
      c.db.insert("users", { email: "b@x.com", name: "Bob", username: "alex02" })
    );
    await t.run((c) =>
      c.db.insert("users", { email: "c@x.com", name: "Cara", username: "zelda" })
    );
    const asMe = t.withIdentity({ subject: meId, email: "me@x.com" });
    const results = await asMe.query(api.users.searchByUsername, { term: "alex" });
    const usernames = results.map((r) => r.username).sort();
    expect(usernames).toEqual(["alex01", "alex02"]);
    // email never returned
    expect((results[0] as Record<string, unknown>).email).toBeUndefined();
  });
});

describe("updateProfile — travellerTags", () => {
  it("persists travellerTags on update", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { email: "tag@x.com", name: "Tagger" })
    );
    const asUser = t.withIdentity({ subject: userId, email: "tag@x.com" });
    const result = await asUser.mutation(api.users.updateProfile, {
      travellerTags: ["adventure", "solo"],
    });
    expect(result?.travellerTags).toEqual(["adventure", "solo"]);
  });
});
