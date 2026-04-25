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

describe("searchByEmail", () => {
  it("returns [] when query is shorter than 3 characters", async () => {
    const t = convexTest(schema, modules);
    const results = await t.query(api.users.searchByEmail, { email: "ab" });
    expect(results).toEqual([]);
  });

  it("returns matching users excluding the caller", async () => {
    const t = convexTest(schema, modules);
    const meId = await t.run((ctx) =>
      ctx.db.insert("users", { email: "me@x.com", name: "Me" })
    );
    const otherId = await t.run((ctx) =>
      ctx.db.insert("users", { email: "other@x.com", name: "Other" })
    );
    const asMe = t.withIdentity({ subject: meId, email: "me@x.com" });
    const results = await asMe.query(api.users.searchByEmail, {
      email: "other@x.com",
    });
    expect(results).toHaveLength(1);
    expect(results[0]._id).toBe(otherId);
    expect(results[0].name).toBe("Other");
    // email must not be leaked in response
    expect((results[0] as Record<string, unknown>).email).toBeUndefined();
  });

  it("excludes the caller even if their email matches", async () => {
    const t = convexTest(schema, modules);
    const meId = await t.run((ctx) =>
      ctx.db.insert("users", { email: "me@x.com", name: "Me" })
    );
    const asMe = t.withIdentity({ subject: meId, email: "me@x.com" });
    const results = await asMe.query(api.users.searchByEmail, {
      email: "me@x.com",
    });
    expect(results).toEqual([]);
  });

  it("returns [] for an email that does not match any user", async () => {
    const t = convexTest(schema, modules);
    const results = await t.query(api.users.searchByEmail, {
      email: "nobody@x.com",
    });
    expect(results).toEqual([]);
  });

  it("matches by partial email substring", async () => {
    const t = convexTest(schema, modules);
    const me = await t.run((c) =>
      c.db.insert("users", { email: "me@x.com", name: "Me" })
    );
    await t.run((c) =>
      c.db.insert("users", { email: "alice@example.com", name: "Alice" })
    );
    await t.run((c) =>
      c.db.insert("users", { email: "bob@example.com", name: "Bob" })
    );
    const asMe = t.withIdentity({ subject: me, email: "me@x.com" });
    const results = await asMe.query(api.users.searchByEmail, {
      email: "example",
    });
    expect(results.map((r) => r.name).sort()).toEqual(["Alice", "Bob"]);
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
