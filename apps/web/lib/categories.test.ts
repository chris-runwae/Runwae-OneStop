import { describe, it, expect } from "vitest";
import { categoryFromType, ALL_CATEGORIES } from "./categories";

describe("categoryFromType", () => {
  it("maps schema enums to UI categories", () => {
    expect(categoryFromType("flight")).toEqual({
      id: "fly", label: "Fly", emoji: "✈️", color: "#2196F3",
    });
    expect(categoryFromType("hotel")).toEqual({
      id: "stay", label: "Stay", emoji: "🏨", color: "#7B68EE",
    });
    expect(categoryFromType("restaurant")).toEqual({
      id: "eat", label: "Eat/Drink", emoji: "🍽", color: "#F5A623",
    });
  });

  it("falls back to 'other' for unknown types", () => {
    // @ts-expect-error — testing runtime fallback
    expect(categoryFromType("nonsense").id).toBe("other");
  });

  it("ALL_CATEGORIES contains the 9 ui-side ids exactly once", () => {
    const ids = ALL_CATEGORIES.map(c => c.id).sort();
    expect(ids).toEqual([
      "adventure", "eat", "event", "fly", "other",
      "ride", "shop", "stay", "tour",
    ]);
  });
});
