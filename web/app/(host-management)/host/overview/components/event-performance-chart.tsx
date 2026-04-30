"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HostEventRow } from "@/lib/supabase/events";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

type EventFilter = "all" | "upcoming" | "past";

const EVENT_FILTER_OPTIONS: { value: EventFilter; label: string }[] = [
  { value: "all", label: "All Events" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past Events" },
];

function filterEvents(events: HostEventRow[], filter: EventFilter): HostEventRow[] {
  if (filter === "all") return events;
  const now = new Date();
  return events.filter((e) => {
    if (!e.start_date) return filter === "all";
    const d = new Date(e.start_date);
    return filter === "upcoming" ? d >= now : d < now;
  });
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function buildChartData(events: HostEventRow[]) {
  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed

  const totals = Array(12).fill(0) as number[];
  for (const e of events) {
    if (!e.start_date) continue;
    const d = new Date(e.start_date);
    if (d.getFullYear() !== year) continue;
    totals[d.getMonth()] += e.view_count ?? 0;
  }

  return MONTHS.map((month, i) => ({
    month,
    value: totals[i],
    highlighted: i === currentMonth,
    faded: i > currentMonth,
  }));
}

function niceMax(max: number) {
  if (max === 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / magnitude) * magnitude;
}

function buildTicks(max: number, count = 6) {
  const step = max / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.round(i * step));
}

interface EventPerformanceChartProps {
  events: HostEventRow[];
}

export function EventPerformanceChart({ events }: EventPerformanceChartProps) {
  const [filter, setFilter] = useState<EventFilter>("all");

  const visibleEvents = filterEvents(events, filter);
  const chartData = buildChartData(visibleEvents);
  const maxValue = niceMax(Math.max(...chartData.map((d) => d.value)));
  const yTicks = buildTicks(maxValue);

  const activeLabel = EVENT_FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? "Events";

  return (
    <div className="overflow-hidden rounded-xl bg-surface sm:rounded-2xl">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-8">
        <div className="min-w-0 flex-1">
          <span className="block text-lg font-medium tracking-tight text-body sm:text-xl">
            Event Performance
          </span>
          <span className="mt-2 block text-sm font-medium tracking-tight text-muted-foreground">
            Track how your event is growing across attendees, bookings, and trip
            plans.
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-base font-medium tracking-tight text-body transition-colors hover:bg-border-disabled/80 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {activeLabel}
              <ChevronDownIcon width={16} height={16} aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            {EVENT_FILTER_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onSelect={() => setFilter(opt.value)}
                className="cursor-pointer"
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chart */}
      <div className="flex overflow-x-auto px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8 lg:px-8">
        {/* Y-axis */}
        <div className="flex w-14 shrink-0 flex-col-reverse justify-between pb-8 text-right text-sm font-medium text-black">
          {yTicks.map((tick) => (
            <span key={tick}>{tick.toLocaleString()}</span>
          ))}
        </div>

        {/* Bars */}
        <div className="flex min-w-0 flex-1 items-end gap-2 sm:min-w-[520px]">
          {chartData.map((bar) => (
            <div
              key={bar.month}
              className="flex flex-1 flex-col items-center gap-3"
            >
              <div className="flex h-[372px] w-full max-w-[62px] items-end self-center">
                <div
                  className={`w-full rounded-t-xl ${
                    bar.highlighted ? "bg-primary" : "bg-border"
                  } ${bar.faded ? "opacity-40" : ""}`}
                  style={{
                    height: `${maxValue > 0 ? (bar.value / maxValue) * 100 : 0}%`,
                    minHeight: bar.value > 0 ? "4px" : "0px",
                  }}
                />
              </div>
              <span className="text-sm font-medium text-black">
                {bar.month}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
