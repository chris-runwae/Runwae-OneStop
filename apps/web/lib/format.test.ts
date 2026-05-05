import { describe, it, expect } from "vitest";
import { formatDateRange } from "./format";

describe("formatDateRange", () => {
  it("renders same-month range as 'Mar 14–18, 2026'", () => {
    const start = Date.UTC(2026, 2, 14);
    const end   = Date.UTC(2026, 2, 18);
    expect(formatDateRange(start, end, "UTC")).toBe("Mar 14–18, 2026");
  });

  it("renders cross-month range as 'Mar 30 – Apr 3, 2026'", () => {
    const start = Date.UTC(2026, 2, 30);
    const end   = Date.UTC(2026, 3, 3);
    expect(formatDateRange(start, end, "UTC")).toBe("Mar 30 – Apr 3, 2026");
  });

  it("renders cross-year range as 'Dec 30, 2026 – Jan 3, 2027'", () => {
    const start = Date.UTC(2026, 11, 30);
    const end   = Date.UTC(2027, 0, 3);
    expect(formatDateRange(start, end, "UTC")).toBe("Dec 30, 2026 – Jan 3, 2027");
  });
});
