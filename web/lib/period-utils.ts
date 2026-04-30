export type Period = "this-month" | "last-month" | "last-3-months" | "this-year";

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "last-3-months", label: "Last 3 months" },
  { value: "this-year", label: "This year" },
];

export function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  switch (period) {
    case "this-month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      };
    case "last-month":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
      };
    case "last-3-months":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      };
    case "this-year":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
      };
  }
}

export function getPreviousPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  switch (period) {
    case "this-month":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
      };
    case "last-month":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        end: new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59),
      };
    case "last-3-months":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 5, 1),
        end: new Date(now.getFullYear(), now.getMonth() - 2, 0, 23, 59, 59),
      };
    case "this-year":
      return {
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59),
      };
  }
}

const PERIOD_COMPARISON_LABEL: Record<Period, string> = {
  "this-month": "from last month",
  "last-month": "from the month before",
  "last-3-months": "from the prior 3 months",
  "this-year": "from last year",
};

export function computeChange(
  current: number,
  previous: number,
  period: Period,
): { change: string; trend: "up" | "down" } {
  const label = PERIOD_COMPARISON_LABEL[period];
  if (previous === 0 && current === 0) return { change: `No data yet`, trend: "up" };
  if (previous === 0) return { change: `New ${label.replace("from ", "")}`, trend: "up" };
  const pct = ((current - previous) / previous) * 100;
  return {
    change: `${pct >= 0 ? "+" : "-"}${Math.abs(pct).toFixed(2)}% ${label}`,
    trend: pct >= 0 ? "up" : "down",
  };
}

export function filterByDateField<T extends Record<string, unknown>>(
  items: T[],
  dateField: keyof T,
  period: Period,
): T[] {
  const { start, end } = getPeriodRange(period);
  return items.filter((item) => {
    const raw = item[dateField];
    if (!raw) return false;
    const d = new Date(raw as string);
    return d >= start && d <= end;
  });
}

export function filterByPrevDateField<T extends Record<string, unknown>>(
  items: T[],
  dateField: keyof T,
  period: Period,
): T[] {
  const { start, end } = getPreviousPeriodRange(period);
  return items.filter((item) => {
    const raw = item[dateField];
    if (!raw) return false;
    const d = new Date(raw as string);
    return d >= start && d <= end;
  });
}
