"use client";

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@runwae/ui/components/chart";

type Point = { t: number; gross: number; commission: number; count: number };

const config: ChartConfig = {
  gross: { label: "Gross", color: "var(--color-primary)" },
  commission: { label: "Commission", color: "var(--color-chart-2)" },
};

export function RevenueLineChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface">
        <p className="text-sm text-muted-foreground">
          No bookings in this window yet.
        </p>
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <LineChart
        data={data.map((p) => ({
          ...p,
          label: new Date(p.t).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
        }))}
        margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="gross"
          stroke="var(--color-gross)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="commission"
          stroke="var(--color-commission)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
