import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, formatCurrency, formatDate, formatRelativeTime } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });
  it("deduplicates tailwind classes keeping last", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });
  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });
});

describe("formatCurrency", () => {
  it("formats GBP amounts", () => {
    expect(formatCurrency(1000, "GBP")).toBe("£1,000");
  });
  it("uses displayCurrency when provided", () => {
    expect(formatCurrency(1000, "GBP", "USD")).toBe("$1,000");
  });
  it("shows decimal places for fractional amounts", () => {
    expect(formatCurrency(9.99, "GBP")).toBe("£9.99");
  });
});

describe("formatDate", () => {
  it("formats epoch ms to a readable date string", () => {
    const result = formatDate(1_700_000_000_000, "Europe/London");
    expect(result).toMatch(/\d+/);
    expect(typeof result).toBe("string");
  });
  it("accepts custom Intl.DateTimeFormatOptions", () => {
    const result = formatDate(1_700_000_000_000, "Europe/London", {
      month: "short",
      day: "numeric",
    });
    expect(result).toBeTruthy();
    expect(result).not.toContain("undefined");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("returns a 'seconds' label for very recent past", () => {
    const result = formatRelativeTime(Date.now() - 5_000);
    expect(result).toMatch(/second|now/i);
  });
  it("returns minutes for 2 minutes ago", () => {
    const result = formatRelativeTime(Date.now() - 2 * 60 * 1000);
    expect(result).toMatch(/2 minutes? ago/i);
  });
  it("returns hours for 3 hours ago", () => {
    const result = formatRelativeTime(Date.now() - 3 * 3_600_000);
    expect(result).toMatch(/3 hours? ago/i);
  });
  it("returns days for 2 days ago", () => {
    const result = formatRelativeTime(Date.now() - 2 * 86_400_000);
    expect(result).toMatch(/2 days? ago/i);
  });
});
