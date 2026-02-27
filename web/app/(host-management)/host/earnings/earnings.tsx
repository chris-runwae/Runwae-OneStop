"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, DownloadIcon } from "lucide-react";
import { EventMetrics } from "../overview/components/event-metrics";

const summaryStats = [
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

const earningsRows = [
  { date: "Oct 14, 2026", period: "Jan 2026", amount: "$14,230", status: "PENDING" as const },
  { date: "Oct 14, 2026", period: "Jan 2026", amount: "$14,230", status: "PAID" as const },
  { date: "Oct 14, 2026", period: "Jan 2026", amount: "$14,230", status: "PENDING" as const },
  { date: "Oct 14, 2026", period: "Jan 2026", amount: "$14,230", status: "PAID" as const },
  { date: "Oct 14, 2026", period: "Jan 2026", amount: "$14,230", status: "PAID" as const },
];

const chartData = [
  { label: "Hotels", percent: 60, value: 94134, color: "hsl(327, 70%, 45%)" },
  { label: "Activities", percent: 25, value: 39223, color: "hsl(304, 65%, 58%)" },
  { label: "Restaurants", percent: 12, value: 18827, color: "hsl(327, 60%, 70%)" },
  { label: "Other", percent: 3, value: 4706, color: "hsl(327, 50%, 85%)" },
];

const C = 2 * Math.PI * 45;
const donutSegments = chartData.map((d, i) => {
  const start = chartData.slice(0, i).reduce((acc, x) => acc + x.percent, 0);
  const length = (d.percent / 100) * C;
  return { ...d, start: (start / 100) * C, length };
});

export default function Earnings() {
  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryStats.map((stat) => (
          <EventMetrics key={stat.label} {...stat} />
        ))}
      </div>

      {/* Earnings breakdown + chart row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Earnings breakdown table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface xl:col-span-2">
          <div className="border-b border-border px-6 py-6 lg:px-10">
            <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
              Earnings Breakdown
            </h2>
            <p className="mt-1 text-sm font-medium tracking-tight text-muted-foreground">
              Each row represents a booking that you earned a commission.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-disabled/80 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    All Events
                    <ChevronDownIcon className="size-4" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[160px]">
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    All Events
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Upcoming
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Past Events
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-disabled/80 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    Last 30 days
                    <ChevronDownIcon className="size-4" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[160px]">
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Last 7 days
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Last 30 days
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Last 90 days
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-disabled/80 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    All Status
                    <ChevronDownIcon className="size-4" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Paid
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="button"
                className="ml-auto flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-light focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <DownloadIcon className="size-4" aria-hidden />
                Download CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-badge/50">
                  <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                    Date
                  </th>
                  <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                    Period
                  </th>
                  <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                    Amount
                  </th>
                  <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                    Status
                  </th>
                  <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody>
                {earningsRows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border transition-colors hover:bg-badge/30"
                  >
                    <td className="px-6 py-4 font-medium text-body lg:px-10">
                      {row.date}
                    </td>
                    <td className="px-6 py-4 font-medium text-body lg:px-10">
                      {row.period}
                    </td>
                    <td className="px-6 py-4 font-medium text-body lg:px-10">
                      {row.amount}
                    </td>
                    <td className="px-6 py-4 lg:px-10">
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
                    <td className="px-6 py-4 lg:px-10">
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

        {/* Earning breakdown chart */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex flex-col gap-4 border-b border-border px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
              Earning Breakdown
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-disabled/80 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  Partner Type
                  <ChevronDownIcon className="size-4" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                  Partner Type
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                  Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-col items-center gap-6 px-6 py-8 lg:px-10">
            <div className="relative size-48 shrink-0 sm:size-56">
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
            <ul className="flex w-full flex-col gap-3">
              {chartData.map((item, i) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden
                    />
                    <span className="font-medium text-body">{item.label}</span>
                  </div>
                  <span className="font-semibold text-heading">
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
