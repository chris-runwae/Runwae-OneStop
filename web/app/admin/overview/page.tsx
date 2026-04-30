"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  TicketCheck,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { adminGetAllEvents } from "@/lib/supabase/admin/events";
import { adminGetAllHosts, adminGetAllUsers } from "@/lib/supabase/admin/users";
import { adminGetAllHotelBookings } from "@/lib/supabase/admin/hotel-bookings";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtMoney(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

export default function AdminOverviewPage() {
  const [activeTab, setActiveTab] = useState("revenue");

  const { data: events = [] } = useQuery({ queryKey: ["admin-events"], queryFn: adminGetAllEvents });
  const { data: hosts = [] } = useQuery({ queryKey: ["admin-hosts"], queryFn: adminGetAllHosts });
  const { data: users = [] } = useQuery({ queryKey: ["admin-users"], queryFn: adminGetAllUsers });
  const { data: bookings = [] } = useQuery({ queryKey: ["admin-bookings"], queryFn: adminGetAllHotelBookings });

  // ── Stats ──────────────────────────────────────────────────────────
  const totalRevenue = bookings.reduce((s, b) => s + (b.total_amount ?? 0), 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);
  const newSignups = users.filter((u) => u.created_at && new Date(u.created_at) > sevenDaysAgo).length;
  const publishedEvents = events.filter((e) => (e.status ?? "").toLowerCase() === "published").length;
  const pendingEvents = events.filter((e) => {
    const s = (e.status ?? "draft").toLowerCase();
    return s === "draft" || s === "pending";
  }).length;

  // ── Monthly revenue chart ──────────────────────────────────────────
  const year = new Date().getFullYear();
  const revByMonth = Array(12).fill(0) as number[];
  for (const b of bookings) {
    if (!b.created_at) continue;
    const d = new Date(b.created_at);
    if (d.getFullYear() !== year) continue;
    revByMonth[d.getMonth()] += b.total_amount ?? 0;
  }

  // ── Booking distribution by type ──────────────────────────────────
  const typeMap = new Map<string, number>();
  for (const b of bookings) {
    const t = b.booking_type ?? "Other";
    typeMap.set(t, (typeMap.get(t) ?? 0) + 1);
  }
  const topTypes = [...typeMap.entries()].sort(([, a], [, b]) => b - a).slice(0, 5);
  const bkLabels = topTypes.length > 0 ? topTypes.map(([l]) => l) : ["No data"];
  const bkData = topTypes.length > 0 ? topTypes.map(([, c]) => c) : [0];

  // ── User signups by month ─────────────────────────────────────────
  const usersByMonth = Array(12).fill(0) as number[];
  for (const u of users) {
    if (!u.created_at) continue;
    const d = new Date(u.created_at);
    if (d.getFullYear() !== year) continue;
    usersByMonth[d.getMonth()]++;
  }
  const userGrowthData = usersByMonth.map((count, month) => [month, count]) as [number, number][];

  // ── Recent activity ────────────────────────────────────────────────
  const recentEvents = events.slice(0, 2).map((e, i) => ({
    id: `ev-${e.id}`,
    color: ["bg-blue-100", "bg-purple-100"][i % 2],
    textColor: ["text-blue-600", "text-purple-600"][i % 2],
    initials: (e.name ?? "EV").slice(0, 2).toUpperCase(),
    title: `${e.name} ${(e.status ?? "").toLowerCase() === "published" ? "published" : "created"}`,
    subtitle: e.location ? `In ${e.location}` : "Location not set",
    time: e.start_date ? new Date(e.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
  }));
  const recentBookings = bookings.slice(0, 2).map((b, i) => ({
    id: `bk-${b.id}`,
    color: ["bg-amber-100", "bg-green-100"][i % 2],
    textColor: ["text-amber-600", "text-green-600"][i % 2],
    initials: (b.hotel_name ?? "HB").slice(0, 2).toUpperCase(),
    title: `Hotel booking${b.hotel_name ? ` at ${b.hotel_name}` : ""} ${b.status ?? "processed"}`,
    subtitle: b.total_amount ? `${b.currency ?? "$"}${b.total_amount.toLocaleString()} charged` : "Amount not recorded",
    time: b.created_at ? new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
  }));
  const recentActivity = [...recentEvents, ...recentBookings];

  // ── Chart options ──────────────────────────────────────────────────
  const revenueOptions: ApexCharts.ApexOptions = {
    chart: { type: "area", toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.0, stops: [0, 100] } },
    colors: ["#D6006C"],
    xaxis: {
      categories: MONTHS,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#6b7280", fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        formatter: (v) => fmtMoney(v),
        style: { colors: "#6b7280", fontSize: "12px" },
      },
    },
    grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
    tooltip: { y: { formatter: (v) => `$${v.toLocaleString()}` } },
  };

  const bookingOptions: ApexCharts.ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, distributed: true } },
    dataLabels: { enabled: false },
    colors: bkLabels.map((_, i) => i < 2 ? "#D6006C" : "#e5e7eb"),
    xaxis: {
      categories: bkLabels,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#374151", fontSize: "13px" } } },
    grid: { show: false },
    legend: { show: false },
    tooltip: { y: { formatter: (v) => `${v.toLocaleString()} bookings` } },
  };

  const userGrowthOptions: ApexCharts.ApexOptions = {
    chart: { type: "scatter", toolbar: { show: false } },
    dataLabels: { enabled: false },
    colors: ["#D6006C"],
    xaxis: {
      categories: MONTHS,
      tickAmount: 12,
      labels: { style: { colors: "#6b7280", fontSize: "12px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      labels: { style: { colors: "#6b7280", fontSize: "12px" } },
    },
    grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
    markers: { size: 5, colors: ["#D6006C"], strokeWidth: 0 },
    tooltip: { y: { formatter: (v) => `${v.toLocaleString()} signups` } },
  };

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-black">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage Event Hosts and their activities.</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={totalRevenue > 0 ? fmtMoney(totalRevenue) : "—"} badge="All time" trend="Live data" up />
        <StatCard label="Active Hosts" value={hosts.length.toLocaleString()} badge="All time" trend="Live data" up />
        <StatCard label="Total Users" value={users.length.toLocaleString()} badge="All time" trend="Live data" up />
        <StatCard label="Total Bookings" value={bookings.length.toLocaleString()} badge="All time" trend="Live data" up />
      </div>

      {/* Secondary Quick Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <QuickStat icon={Users} color="text-emerald-500 bg-emerald-50" value={newSignups.toString()} label="New Signups (7d)" />
        <QuickStat icon={TicketCheck} color="text-sky-500 bg-sky-50" value={events.length.toString()} label="Total Events" />
        <QuickStat icon={Clock} color="text-amber-500 bg-amber-50" value={pendingEvents.toString()} label="Pending Events" />
        <QuickStat icon={CheckCircle} color="text-rose-500 bg-rose-50" value={publishedEvents.toString()} label="Published Events" />
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
                <p className="text-xs text-muted-foreground">Monthly hotel booking revenue for {year}</p>
              </div>
            </div>
            <Chart type="area" height={280} options={revenueOptions} series={[{ name: "Revenue", data: revByMonth }]} />
          </TabsContent>

          <TabsContent value="booking">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-black">Booking Distribution</h2>
                <p className="text-xs text-muted-foreground">Breakdown by booking type</p>
              </div>
            </div>
            <Chart type="bar" height={240} options={bookingOptions} series={[{ name: "Bookings", data: bkData }]} />
            <p className="mt-3 text-sm font-medium text-black">
              Total Bookings: <span className="text-muted-foreground">{bookings.length.toLocaleString()}</span>
            </p>
          </TabsContent>

          <TabsContent value="users">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-black">User Growth Trends</h2>
                <p className="text-xs text-muted-foreground">Monthly new signups for {year}</p>
              </div>
            </div>
            <Chart type="scatter" height={280} options={userGrowthOptions} series={[{ name: "Signups", data: userGrowthData }]} />
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
        {recentActivity.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No recent activity yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold", item.color, item.textColor)}>
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
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, badge, trend, up }: { label: string; value: string; badge: string; trend: string; up: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className="rounded-full border border-border px-2 py-0.5 text-2.5 font-medium text-muted-foreground">{badge}</span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-black">{value}</p>
      <p className={cn("mt-1.5 flex items-center gap-1 text-xs font-medium", up ? "text-emerald-600" : "text-rose-500")}>
        {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
        {trend}
      </p>
    </div>
  );
}

function QuickStat({ icon: Icon, color, value, label }: { icon: React.ElementType; color: string; value: string; label: string }) {
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
