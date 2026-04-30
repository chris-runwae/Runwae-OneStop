"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PERIOD_OPTIONS, type Period } from "@/lib/period-utils";
import { ChevronDownIcon, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

export interface PeriodData {
  value: string;
  change: string;
  trend: "up" | "down";
}

export interface EventMetricsProps {
  label: string;
  // Static mode — fixed value/change/trend (no period selector)
  value?: string;
  change?: string;
  trend?: "up" | "down";
  // Dynamic mode — period selector drives data
  getData?: (period: Period) => PeriodData;
}

export function EventMetrics({
  label,
  value: staticValue,
  change: staticChange,
  trend: staticTrend,
  getData,
}: EventMetricsProps) {
  const [period, setPeriod] = useState<Period>("this-month");

  const dynamic = getData ? getData(period) : null;
  const value = dynamic?.value ?? staticValue ?? "—";
  const change = dynamic?.change ?? staticChange ?? "";
  const trend = dynamic?.trend ?? staticTrend ?? "up";

  const periodLabel =
    PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "This month";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
        <span className="text-sm font-medium tracking-tight text-body">
          {label}
        </span>
        {getData && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 rounded bg-badge px-2 py-1.5 text-xs font-medium tracking-tight text-body transition-colors hover:bg-badge/80 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {periodLabel}
                <ChevronDownIcon className="size-3.5" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-35">
              {PERIOD_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => setPeriod(option.value)}
                  className="cursor-pointer"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4">
        <p className="font-display text-2xl font-semibold leading-tight text-black sm:text-8 sm:leading-10">
          {value}
        </p>
        {change && (
          <div className="mt-3 flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="size-4 shrink-0 text-success" aria-hidden />
            ) : (
              <TrendingDown className="size-4 shrink-0 text-error" aria-hidden />
            )}
            <span
              className={`text-sm font-semibold ${
                trend === "up" ? "text-success" : "text-error"
              }`}
            >
              {change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
