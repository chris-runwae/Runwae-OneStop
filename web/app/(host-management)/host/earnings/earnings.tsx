"use client";

import { DownloadIcon } from "lucide-react";
import { EventMetrics } from "../overview/components/event-metrics";
import { FilterDropdown } from "../components/filter-dropdown";

const SUMMARY_STATS = [
  {
    label: "Total Earnings",
    value: "$6,960",
    change: "+10.23% from last month",
    trend: "up" as const,
  },
  {
    label: "Total Payout",
    value: "$5,800",
    change: "+10.23% from last month",
    trend: "up" as const,
  },
  {
    label: "Pending Payouts",
    value: "$504",
    change: "+10.23% from last month",
    trend: "down" as const,
  },
];

const EARNINGS_ROWS = [
  { date: "Oct 14, 2026", period: "Jan 2026", amount: "$14,230", status: "PENDING" as const },
  { date: "Oct 14, 2026", period: "Jan 2026", amount: "$14,230", status: "PAID" as const },
  { date: "Oct 14, 2026", period: "Jan 2026", amount: "$14,230", status: "PENDING" as const },
  { date: "Oct 14, 2026", period: "Jan 2026", amount: "$14,230", status: "PAID" as const },
  { date: "Oct 14, 2026", period: "Jan 2026", amount: "$14,230", status: "PAID" as const },
];

const EVENT_OPTIONS = [
  { value: "all", label: "All Events" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past Events" },
];

const DATE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
];

const CHART_DATA = [
  { label: "Hotels", percent: 60, value: 94134, color: "hsl(327, 70%, 45%)" },
  { label: "Activities", percent: 25, value: 39223, color: "hsl(304, 65%, 58%)" },
  { label: "Restaurants", percent: 12, value: 18827, color: "hsl(327, 60%, 70%)" },
  { label: "Other", percent: 3, value: 4706, color: "hsl(327, 50%, 85%)" },
];

const C = 2 * Math.PI * 45;
const donutSegments = CHART_DATA.map((d, i) => {
  const start = CHART_DATA.slice(0, i).reduce((acc, x) => acc + x.percent, 0);
  const length = (d.percent / 100) * C;
  return { ...d, start: (start / 100) * C, length };
});

const PARTNER_OPTIONS = [
  { value: "type", label: "Partner Type" },
  { value: "category", label: "Category" },
];

const tableHeader =
  "px-4 py-3 font-display font-semibold text-heading sm:px-6 lg:px-10 lg:py-4";
const tableCell =
  "px-4 py-3 font-medium text-body sm:px-6 lg:px-10 lg:py-4";

export default function Earnings() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8 xl:p-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUMMARY_STATS.map((stat) => (
          <EventMetrics key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-border bg-surface xl:col-span-2 sm:rounded-2xl">
          <div className="border-b border-border px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
            <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
              Earnings Breakdown
            </h2>
            <p className="mt-1 text-sm font-medium tracking-tight text-muted-foreground">
              Each row represents a booking that you earned a commission.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
              <FilterDropdown label="All Events" options={EVENT_OPTIONS} />
              <FilterDropdown label="Last 30 days" options={DATE_OPTIONS} />
              <FilterDropdown label="All Status" options={STATUS_OPTIONS} />
              <button
                type="button"
                className="ml-auto flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-light focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <DownloadIcon className="size-4" aria-hidden />
                Download CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-badge/50">
                  <th className={tableHeader}>Date</th>
                  <th className={tableHeader}>Period</th>
                  <th className={tableHeader}>Amount</th>
                  <th className={tableHeader}>Status</th>
                  <th className={tableHeader}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {EARNINGS_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border transition-colors hover:bg-badge/30"
                  >
                    <td className={tableCell}>{row.date}</td>
                    <td className={tableCell}>{row.period}</td>
                    <td className={tableCell}>{row.amount}</td>
                    <td className={tableCell}>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          row.status === "PAID"
                            ? "bg-success/15 text-success"
                            : "bg-amber-500/15 text-amber-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className={tableCell}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                      >
                        <DownloadIcon className="size-4" aria-hidden />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
          <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-8 lg:py-6">
            <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
              Earning Breakdown
            </h2>
            <FilterDropdown
              label="Partner Type"
              options={PARTNER_OPTIONS}
              align="end"
            />
          </div>
          <div className="flex flex-col items-center gap-4 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8">
            <div className="relative size-40 shrink-0 sm:size-48 md:size-56">
              <svg
                viewBox="0 0 100 100"
                className="size-full -rotate-90"
                aria-hidden
              >
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={`${seg.length} ${C - seg.length}`}
                    strokeDashoffset={-seg.start}
                  />
                ))}
              </svg>
            </div>
            <ul className="flex w-full min-w-0 flex-col gap-3">
              {CHART_DATA.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden
                    />
                    <span className="truncate font-medium text-body">{item.label}</span>
                  </div>
                  <span className="shrink-0 font-semibold text-heading">
                    {item.percent}% ($
                    {item.value.toLocaleString()})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
