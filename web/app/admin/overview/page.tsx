"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  Users,
  TicketCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter,
  Plane,
  Hotel,
  UtensilsCrossed,
  Activity,
  MoreHorizontal,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const REVENUE_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const revenueChartOptions: ApexCharts.ApexOptions = {
  chart: { type: "area", toolbar: { show: false }, sparkline: { enabled: false } },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },
  fill: {
    type: "gradient",
    gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.0, stops: [0, 100] },
  },
  colors: ["#D6006C"],
  xaxis: {
    categories: REVENUE_MONTHS,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: "#6b7280", fontSize: "12px" } },
  },
  yaxis: {
    labels: {
      formatter: (v) => `$${v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`,
      style: { colors: "#6b7280", fontSize: "12px" },
    },
  },
  grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
  tooltip: { y: { formatter: (v) => `$${v.toLocaleString()}` } },
};

const revenueChartSeries = [
  {
    name: "Revenue",
    data: [800000, 1200000, 900000, 1500000, 1800000, 1200000, 1600000, 1900000, 1400000, 2100000, 1800000, 2200000],
  },
];

const bookingChartOptions: ApexCharts.ApexOptions = {
  chart: { type: "bar", toolbar: { show: false } },
  plotOptions: {
    bar: { horizontal: true, borderRadius: 4, distributed: true },
  },
  dataLabels: { enabled: false },
  colors: ["#D6006C", "#D6006C", "#e5e7eb", "#e5e7eb", "#e5e7eb"],
  xaxis: {
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: "#374151", fontSize: "13px" } },
  },
  grid: { show: false },
  legend: { show: false },
  tooltip: { y: { formatter: (v) => `${v.toLocaleString()} bookings` } },
};

const bookingChartSeries = [
  {
    name: "Bookings",
    data: [4350, 3200, 2100, 1800, 900],
  },
];

const userGrowthOptions: ApexCharts.ApexOptions = {
  chart: { type: "scatter", toolbar: { show: false } },
  dataLabels: { enabled: false },
  colors: ["#D6006C"],
  xaxis: {
    categories: REVENUE_MONTHS,
    tickAmount: 12,
    labels: { style: { colors: "#6b7280", fontSize: "12px" } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    min: 0,
    max: 2400,
    tickAmount: 6,
    labels: { style: { colors: "#6b7280", fontSize: "12px" } },
  },
  grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
  markers: { size: 5, colors: ["#D6006C"], strokeWidth: 0 },
  tooltip: { y: { formatter: (v) => `${v.toLocaleString()} users` } },
};

const userGrowthSeries = [
  {
    name: "Users",
    data: [
      [0, 1000], [1, 1200], [2, 900], [3, 1500], [4, 1100], [5, 1800],
      [6, 1400], [7, 2000], [8, 1700], [9, 2200], [10, 1900], [11, 2350],
    ],
  },
];

const recentActivity = [
  {
    id: 1,
    color: "bg-blue-100",
    textColor: "text-blue-600",
    initials: "AN",
    title: "AfroNation created a new event",
    subtitle: "Event scheduled for Dec 24 in Lagos",
    time: "2 minutes ago",
  },
  {
    id: 2,
    color: "bg-purple-100",
    textColor: "text-purple-600",
    initials: "PH",
    title: "Pestana Hotel accepted a partnership",
    subtitle: "Linked to AfroNation event",
    time: "10 minutes ago",
  },
  {
    id: 3,
    color: "bg-amber-100",
    textColor: "text-amber-600",
    initials: "NV",
    title: "New Vendor Registered",
    subtitle: "Restaurants Mont joined the platform",
    time: "40 minutes ago",
  },
  {
    id: 4,
    color: "bg-green-100",
    textColor: "text-green-600",
    initials: "B#",
    title: "Booking #12345 completed",
    subtitle: "$1,450 payment confirmed",
    time: "1 hour ago",
  },
];

const bookingCategories = [
  { label: "Flights", icon: Plane },
  { label: "Hotels", icon: Hotel },
  { label: "Restaurant", icon: UtensilsCrossed },
  { label: "Activities", icon: Activity },
  { label: "Others", icon: MoreHorizontal },
];

export default function AdminOverviewPage() {
  const [activeTab, setActiveTab] = useState("revenue");

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-black">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage Event Hosts and their activities.</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total GMV"
          value="$5.2M"
          badge="This month"
          trend="+34% MoM"
          up
        />
        <StatCard
          label="Platform Revenue"
          value="$520K"
          badge="This month"
          trend="+10% of GMV"
          up
        />
        <StatCard
          label="Active Users"
          value="1,245"
          badge="This month"
          trend="↑"
          up
        />
        <StatCard
          label="Bookings"
          value="12,345"
          badge="This week"
          trend="+10.23% from last month"
          up
        />
      </div>

      {/* Secondary Quick Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <QuickStat icon={Users} color="text-emerald-500 bg-emerald-50" value="100" label="New Signups" />
        <QuickStat icon={TicketCheck} color="text-sky-500 bg-sky-50" value="08" label="Open Tickets" />
        <QuickStat icon={Clock} color="text-amber-500 bg-amber-50" value="12" label="Pending Verification" />
        <QuickStat icon={AlertTriangle} color="text-rose-500 bg-rose-50" value="03" label="Failed Payouts" />
      </div>

      {/* Tabbed Charts */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line" className="mb-6">
            <TabsTrigger value="revenue">Revenue Performance</TabsTrigger>
            <TabsTrigger value="booking">Booking Distribution</TabsTrigger>
            <TabsTrigger value="users">User Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-black">Revenue Trend</h2>
                <p className="text-xs text-muted-foreground">Track total transaction value vs earnings</p>
              </div>
              <div className="flex items-center gap-2">
                <FilterChip label="Platform Revenue" />
                <FilterChip label="7 Days" />
              </div>
            </div>
            <Chart
              type="area"
              height={280}
              options={revenueChartOptions}
              series={revenueChartSeries}
            />
          </TabsContent>

          <TabsContent value="booking">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-black">Booking Distribution</h2>
                <p className="text-xs text-muted-foreground">See how bookings are spread across categories.</p>
              </div>
              <FilterChip label="7 Days" />
            </div>
            <Chart
              type="bar"
              height={240}
              options={{
                ...bookingChartOptions,
                yaxis: {
                  labels: {
                    style: { colors: "#374151", fontSize: "13px" },
                    formatter: (_v, _opts) => bookingCategories[(_opts as any)?.dataPointIndex]?.label ?? "",
                  },
                },
                xaxis: {
                  ...bookingChartOptions.xaxis,
                  categories: bookingCategories.map((c) => c.label),
                },
              }}
              series={bookingChartSeries}
            />
            <p className="mt-3 text-sm font-medium text-black">
              Total Booking: <span className="text-muted-foreground">12,345</span>
            </p>
          </TabsContent>

          <TabsContent value="users">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-black">User Growth Trends</h2>
                <p className="text-xs text-muted-foreground">Monitor how hosts, vendors, and attendees are growing over time.</p>
              </div>
              <div className="flex items-center gap-2">
                <FilterChip label="Startree Revenue" />
                <FilterChip label="7 Days" />
              </div>
            </div>
            <Chart
              type="scatter"
              height={280}
              options={userGrowthOptions}
              series={userGrowthSeries}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-black">Recent Activity</h2>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-body hover:bg-muted/40 transition-colors"
          >
            <Filter className="size-3.5" />
            Filter
          </button>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  item.color,
                  item.textColor,
                )}
              >
                {item.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-black">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  badge,
  trend,
  up,
}: {
  label: string;
  value: string;
  badge: string;
  trend: string;
  up: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className="rounded-full border border-border px-2 py-0.5 text-2.5 font-medium text-muted-foreground">
          {badge}
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-black">{value}</p>
      <p
        className={cn(
          "mt-1.5 flex items-center gap-1 text-xs font-medium",
          up ? "text-emerald-600" : "text-rose-500",
        )}
      >
        {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
        {trend}
      </p>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  color,
  value,
  label,
}: {
  icon: React.ElementType;
  color: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", color)}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="font-display text-xl font-bold text-black">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-body hover:bg-muted/40 transition-colors"
    >
      {label}
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-50">
        <path d="M2.5 3.75L5 6.25L7.5 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
