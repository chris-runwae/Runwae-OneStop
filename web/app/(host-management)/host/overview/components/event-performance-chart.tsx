"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";

export interface ChartBarData {
  month: string;
  value: number;
  highlighted?: boolean;
  faded?: boolean;
}

const chartData: ChartBarData[] = [
  { month: "Jan", value: 4700 },
  { month: "Feb", value: 9100 },
  { month: "Mar", value: 3500 },
  { month: "Apr", value: 19400 },
  { month: "May", value: 22800 },
  { month: "Jun", value: 15600 },
  { month: "Jul", value: 9500 },
  { month: "Aug", value: 14400 },
  { month: "Sep", value: 27000 },
  { month: "Oct", value: 17700 },
  { month: "Nov", value: 28500, highlighted: true },
  { month: "Dec", value: 14400, faded: true },
];

const MAX_VALUE = 30000;
const Y_TICKS = [0, 5000, 10000, 15000, 20000, 25000, 30000];

export function EventPerformanceChart() {
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
              Events
              <ChevronDownIcon width={16} height={16} aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
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
      </div>

      {/* Chart */}
      <div className="flex overflow-x-auto px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8 lg:px-8">
        {/* Y-axis */}
        <div className="flex w-14 shrink-0 flex-col-reverse justify-between pb-8 text-right text-sm font-medium text-black">
          {Y_TICKS.map((tick) => (
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
                    height: `${(bar.value / MAX_VALUE) * 100}%`,
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
