"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { EventMetrics } from "../overview/components/event-metrics";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const kpiCards = [
  {
    label: "Top Attendees",
    value: "15,760",
    change: "+10.23% from last month",
    trend: "up" as const,
  },
  {
    label: "Trips Planed",
    value: "456",
    change: "+10.23% from last month",
    trend: "up" as const,
  },
  {
    label: "Bookings Made",
    value: "321",
    change: "+10.23% from last month",
    trend: "up" as const,
  },
  {
    label: "Conversion rate",
    value: "$34,056",
    change: "+10.23% from last month",
    trend: "up" as const,
  },
];

const topCountries = [
  { name: "Nigeria", value: 92 },
  { name: "Ghana", value: 78 },
  { name: "Cameroon", value: 55 },
  { name: "Kenya", value: 42 },
  { name: "Uganda", value: 38 },
  { name: "Tanzania", value: 28 },
];

const topItineraries = [
  { label: "A sunny at the Pitakwa Beach", percent: 90 },
  { label: "Other", percent: 10 },
];

const topCountriesChartOptions: ApexOptions = {
  chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: "65%",
      borderRadius: 4,
      distributed: true,
    },
  },
  colors: [
    "hsl(327, 70%, 55%)",
    "hsl(327, 70%, 55%)",
    "hsl(0, 0%, 75%)",
    "hsl(0, 0%, 75%)",
    "hsl(0, 0%, 75%)",
    "hsl(0, 0%, 75%)",
  ],
  dataLabels: { enabled: false },
  xaxis: {
    categories: topCountries.map((c) => c.name),
    labels: { style: { colors: "hsl(var(--body))" } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: "hsl(var(--body))" } },
  },
  grid: {
    borderColor: "hsl(var(--border))",
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  legend: { show: false },
  tooltip: { theme: "light" },
};

const topItinerariesChartOptions: ApexOptions = {
  chart: { type: "donut", fontFamily: "inherit" },
  labels: topItineraries.map((i) => i.label),
  colors: ["hsl(327, 70%, 45%)", "hsl(0, 0%, 85%)"],
  plotOptions: {
    pie: {
      donut: { size: "65%" },
      expandOnClick: false,
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (_, opts) => `${opts.w.config.series[opts.seriesIndex]}%`,
  },
  legend: { show: false },
  tooltip: { theme: "light" },
};

// Simple world map marker positions (approx lat/lng as % of container)
const mapMarkers = [
  { x: 22, y: 38 },   // North America
  { x: 28, y: 52 },   // Europe
  { x: 52, y: 42 },   // Asia
  { x: 48, y: 62 },   // Russia
  { x: 52, y: 28 },   // Middle East
  { x: 50, y: 52 },   // Africa
  { x: 32, y: 72 },   // South America
  { x: 78, y: 68 },   // Australia
];

const eventOptions = [
  { value: "event-1", label: "Pitakwa Beach Festival 2026" },
  { value: "event-2", label: "Lagos Tech Summit" },
  { value: "event-3", label: "Accra Music Week" },
];

export default function AttendeeInsights() {
  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
            Attendee Insights
          </h1>
          <p className="mt-1 text-sm font-medium tracking-tight text-muted-foreground">
            Understand where your attendees are coming from and how they plan their Trips.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium tracking-tight text-body transition-colors hover:bg-badge focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Select Event
              <ChevronDownIcon className="size-4" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[220px]">
            {eventOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => {}}
                className="cursor-pointer"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <EventMetrics key={card.label} {...card} />
        ))}
      </div>

      {/* Attendee Location - Map */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-4 lg:px-10">
          <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
            Attendee Location
          </h2>
        </div>
        <div className="relative w-full overflow-hidden bg-muted/50 lg:aspect-[2.2/1] min-h-[280px]">
          <svg
            viewBox="0 0 1000 500"
            className="absolute inset-0 h-full w-full opacity-60"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            {/* Simplified continent shapes - grey fill */}
            <path fill="currentColor" className="text-border" d="M120 180h80v120h-80z M220 140h100v160h-100z M340 160h80v140h-80z M500 120h120v180h-120z M640 140h100v160h-100z M760 160h80v140h-80z M120 320h90v100h-90z M230 300h110v120h-110z M360 320h100v100h-100z M480 310h140v110h-140z M640 320h100v100h-100z M760 320h80v100h-80z" />
          </svg>
          <svg
            viewBox="0 0 1000 500"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            {/* Pink markers */}
            {mapMarkers.map((m, i) => (
              <circle
                key={i}
                cx={m.x * 10}
                cy={m.y * 5}
                r="14"
                fill="hsl(327, 70%, 55%)"
                className="drop-shadow-sm"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Top Countries + Top Itineraries */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Top Countries - horizontal bar chart */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4 lg:px-10">
            <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
              Top Countries
            </h2>
          </div>
          <div className="px-6 py-6 lg:px-10">
            <ReactApexChart
              type="bar"
              height={280}
              options={topCountriesChartOptions}
              series={[{ name: "Attendees", data: topCountries.map((c) => c.value) }]}
            />
          </div>
        </div>

        {/* Top Itineraries - donut chart */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4 lg:px-10">
            <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
              Top Itineraries
            </h2>
          </div>
          <div className="px-6 py-8 lg:px-10">
            <ReactApexChart
              type="donut"
              height={320}
              options={topItinerariesChartOptions}
              series={topItineraries.map((i) => i.percent)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
