"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { ChevronDownIcon, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@runwae/ui/components/dropdown-menu";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Period } from "@/lib/period-utils";

type Scope = { kind: "all" } | { kind: "event"; eventId: Id<"events">; name: string };

const RANGE_OPTIONS: { value: Period; label: string }[] = [
  { value: "this_year", label: "This year" },
  { value: "last_3_months", label: "Last 3 months" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
];

// Deterministic dummy series so first-time hosts see a populated chart.
function buildDemoBuckets(range: Period) {
  const labels =
    range === "this_year"
      ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
      : range === "last_3_months"
      ? ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7", "Wk 8", "Wk 9", "Wk 10", "Wk 11", "Wk 12"]
      : Array.from({ length: 14 }, (_, i) => `D${i + 1}`);
  const baseline = [12, 18, 25, 30, 22, 35, 48, 42, 55, 60, 50, 38, 28, 20];
  return labels.map((label, i) => ({
    bucket: `demo-${i}`,
    label,
    views: baseline[i % baseline.length],
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

export function EventPerformanceChart() {
  const [scope, setScope] = useState<Scope>({ kind: "all" });
  const [range, setRange] = useState<Period>("this_year");

  const eventList = useQuery(api.host.events.listAllForHost, {});
  const series = useQuery(api.host.analytics.getViewsTimeSeries, {
    scope:
      scope.kind === "all"
        ? "all"
        : { eventId: scope.eventId },
    range,
  });

  const isDemo = useMemo(() => {
    if (!series) return true;
    return (series.total ?? 0) === 0;
  }, [series]);

  const chartData = useMemo(() => {
    if (isDemo) return buildDemoBuckets(range);
    return series!.buckets;
  }, [series, isDemo, range]);

  const maxValue = niceMax(Math.max(0, ...chartData.map((d) => d.views)));
  const yTicks = buildTicks(maxValue);

  const scopeLabel =
    scope.kind === "all" ? "All Events" : scope.name;
  const rangeLabel =
    RANGE_OPTIONS.find((r) => r.value === range)?.label ?? "This year";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div className="min-w-0 flex-1">
          <span className="block text-lg font-medium tracking-tight text-heading sm:text-xl">
            Event Performance
          </span>
          <span className="mt-1 block text-sm font-medium tracking-tight text-muted-foreground">
            Track how your events grow across views over time.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-muted px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {scopeLabel}
                <ChevronDownIcon className="size-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              <DropdownMenuItem
                onSelect={() => setScope({ kind: "all" })}
                className="cursor-pointer"
              >
                All Events
              </DropdownMenuItem>
              {eventList && eventList.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                    Specific event
                  </DropdownMenuLabel>
                  {eventList.slice(0, 20).map((e) => (
                    <DropdownMenuItem
                      key={e._id}
                      onSelect={() =>
                        setScope({ kind: "event", eventId: e._id, name: e.name })
                      }
                      className="cursor-pointer"
                    >
                      <span className="truncate">{e.name}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-muted px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {rangeLabel}
                <ChevronDownIcon className="size-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              {RANGE_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => setRange(opt.value)}
                  className="cursor-pointer"
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isDemo && (
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground sm:px-6">
          <Sparkles className="size-3.5 shrink-0 text-primary" aria-hidden />
          <span>
            Sample data — your event performance will replace this once your
            events start receiving views.
          </span>
        </div>
      )}

      <div className="flex overflow-x-auto px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8">
        <div className="flex w-14 shrink-0 flex-col-reverse justify-between pb-8 text-right text-xs font-medium text-muted-foreground">
          {yTicks.map((tick) => (
            <span key={tick}>{tick.toLocaleString()}</span>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 items-end gap-1 sm:gap-2 sm:min-w-[520px]">
          {chartData.map((bar, i) => {
            const lastIdx = chartData.length - 1;
            const isLast = i === lastIdx && !isDemo;
            return (
              <div
                key={bar.bucket}
                className="flex flex-1 flex-col items-center gap-3"
              >
                <div className="flex h-72 w-full max-w-12 items-end self-center">
                  <div
                    className={`w-full rounded-t-xl transition-all ${
                      isLast
                        ? "bg-primary"
                        : isDemo
                        ? "bg-primary/30"
                        : "bg-border"
                    }`}
                    style={{
                      height: `${
                        maxValue > 0 ? (bar.views / maxValue) * 100 : 0
                      }%`,
                      minHeight: bar.views > 0 ? "4px" : "0px",
                    }}
                  />
                </div>
                <span className="truncate text-[11px] font-medium text-muted-foreground">
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
