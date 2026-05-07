export type Period =
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "this_year";

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_3_months", label: "Last 3 months" },
  { value: "this_year", label: "This year" },
];

const PERIOD_COMPARISON_LABEL: Record<Period, string> = {
  this_month: "from last month",
  last_month: "from the month before",
  last_3_months: "from the prior 3 months",
  this_year: "from last year",
};

export function computeChange(
  current: number,
  previous: number,
  period: Period
): { change: string; trend: "up" | "down" } {
  const label = PERIOD_COMPARISON_LABEL[period];
  if (previous === 0 && current === 0) {
    return { change: "No data yet", trend: "up" };
  }
  if (previous === 0) {
    return { change: `New ${label.replace("from ", "")}`, trend: "up" };
  }
  const pct = ((current - previous) / previous) * 100;
  return {
    change: `${pct >= 0 ? "+" : "-"}${Math.abs(pct).toFixed(2)}% ${label}`,
    trend: pct >= 0 ? "up" : "down",
  };
}
