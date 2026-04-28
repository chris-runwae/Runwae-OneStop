import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../convex/schema";
import { api } from "../convex/_generated/api";

const modules = import.meta.glob("../convex/**/*.*s");

describe("discovery.searchByCategory", () => {
  it("returns static items for the eat category", async () => {
    const t = convexTest(schema, modules);
    const items = await t.action(api.discovery.searchByCategory, { category: "eat", term: "" });
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].provider).toBe("static");
  });

  it("caches results — second call has a cache row", async () => {
    const t = convexTest(schema, modules);
    await t.action(api.discovery.searchByCategory, { category: "eat", term: "italian" });
    const rows = await t.run(c =>
      c.db.query("discovery_cache").collect()
    );
    expect(rows.length).toBeGreaterThan(0);
    const cached = rows.find(r => r.category === "eat");
    expect(cached?.queryKey).toContain("italian");
  });
});
