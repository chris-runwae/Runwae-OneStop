"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import {
  getAttendeeInsights,
  type AttendeeInsights,
  type HotelBookingItem,
} from "@/lib/supabase/attendee-insights";
import { getEvents, type Event } from "@/lib/supabase/events";
import type { PeriodData } from "../overview/components/event-metrics";
import type { ApexOptions } from "apexcharts";
import { ChevronDownIcon } from "lucide-react";
import dynamic from "next/dynamic";
import {
  computeChange,
  filterByDateField,
  filterByPrevDateField,
  type Period,
} from "@/lib/period-utils";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { EventMetrics } from "../overview/components/event-metrics";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

function NoData() {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
      No sufficient data to curate this portion yet.
    </div>
  );
}

function buildTreemapOptions(): ApexOptions {
  return {
    chart: { type: "treemap", toolbar: { show: false }, fontFamily: "inherit" },
    colors: [
      "hsl(327, 70%, 45%)",
      "hsl(327, 70%, 55%)",
      "hsl(327, 70%, 65%)",
      "hsl(327, 70%, 72%)",
      "hsl(0, 0%, 70%)",
      "hsl(0, 0%, 80%)",
    ],
    dataLabels: {
      enabled: true,
      style: { fontSize: "13px", fontWeight: "600" },
    },
    plotOptions: {
      treemap: { distributed: true, enableShades: false },
    },
    legend: { show: false },
    tooltip: { theme: "light" },
  };
}

function buildBarOptions(categories: string[]): ApexOptions {
  return {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: {
      bar: { horizontal: true, barHeight: "65%", borderRadius: 4, distributed: true },
    },
    colors: categories.map((_, i) =>
      i < 2 ? "hsl(327, 70%, 55%)" : "hsl(0, 0%, 75%)",
    ),
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: { style: { colors: "hsl(var(--body))" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "hsl(var(--body))" } } },
    grid: {
      borderColor: "hsl(var(--border))",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    tooltip: { theme: "light" },
  };
}

function buildDonutOptions(labels: string[]): ApexOptions {
  return {
    chart: { type: "donut", fontFamily: "inherit" },
    labels,
    colors: [
      "hsl(327, 70%, 45%)",
      "hsl(327, 70%, 60%)",
      "hsl(327, 70%, 75%)",
      "hsl(0, 0%, 75%)",
      "hsl(0, 0%, 85%)",
    ],
    plotOptions: {
      pie: { donut: { size: "65%" }, expandOnClick: false },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`,
    },
    legend: { show: false },
    tooltip: { theme: "light" },
  };
}

const EMPTY_INSIGHTS: AttendeeInsights = {
  totalAttendees: 0,
  tripsPlanned: 0,
  bookingsMade: 0,
  topItineraries: [],
  topLocations: [],
  eventRows: [],
  itineraryRows: [],
  hotelRows: [],
};

function makeAttendeesData(
  eventRows: { current_participants: number | null; start_date: string | null }[],
) {
  return (period: Period): PeriodData => {
    const current = filterByDateField(eventRows, "start_date", period).reduce(
      (sum, e) => sum + (e.current_participants ?? 0), 0,
    );
    const previous = filterByPrevDateField(eventRows, "start_date", period).reduce(
      (sum, e) => sum + (e.current_participants ?? 0), 0,
    );
    const { change, trend } = computeChange(current, previous, period);
    return { value: current.toLocaleString(), change, trend };
  };
}

function makeTripsData(
  itineraryRows: { id: string; created_at: string | null }[],
) {
  return (period: Period): PeriodData => {
    const current = filterByDateField(itineraryRows, "created_at", period).length;
    const previous = filterByPrevDateField(itineraryRows, "created_at", period).length;
    const { change, trend } = computeChange(current, previous, period);
    return { value: current.toLocaleString(), change, trend };
  };
}

function makeBookingsData(hotelRows: HotelBookingItem[]) {
  return (period: Period): PeriodData => {
    const current = filterByDateField(hotelRows, "created_at", period).reduce(
      (sum, b) => sum + (b.guests ?? 0), 0,
    );
    const previous = filterByPrevDateField(hotelRows, "created_at", period).reduce(
      (sum, b) => sum + (b.guests ?? 0), 0,
    );
    const { change, trend } = computeChange(current, previous, period);
    return { value: current.toLocaleString(), change, trend };
  };
}

export default function AttendeeInsights() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [insights, setInsights] = useState<AttendeeInsights>(EMPTY_INSIGHTS);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;

  const loadInsights = useCallback(
    (eventId?: string) => {
      if (!user) return;
      getAttendeeInsights(user.id, eventId)
        .then(setInsights)
        .catch((err: Error) => toast.error(err.message ?? "Failed to load insights"));
    },
    [user],
  );

  useEffect(() => {
    if (!user) return;
    getEvents(user.id)
      .then(setEvents)
      .catch((err: Error) => toast.error(err.message ?? "Failed to load events"));
  }, [user]);

  useEffect(() => {
    loadInsights(selectedEventId ?? undefined);
  }, [loadInsights, selectedEventId]);

  const attendeesData = makeAttendeesData(insights.eventRows);
  const tripsData = makeTripsData(insights.itineraryRows);
  const bookingsData = makeBookingsData(insights.hotelRows);

  // Treemap — location names + attendee counts
  const hasLocationData = insights.topLocations.length > 0;
  const treemapSeries = [{
    data: insights.topLocations.map((l) => ({ x: l.label, y: l.value })),
  }];

  // Top locations bar chart
  const locationLabels = insights.topLocations.map((l) => l.label);
  const locationSeries = [{ name: "Attendees", data: insights.topLocations.map((l) => l.value) }];

  // Top itineraries donut
  const hasItinData = insights.topItineraries.length > 0;
  const itinLabels = insights.topItineraries.map((i) => i.label);
  const itinSeries = insights.topItineraries.map((i) => i.count);

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8 xl:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
            Attendee Insights
          </h1>
          <p className="mt-1 text-sm font-medium tracking-tight text-muted-foreground">
            Understand where your attendees are coming from and how they plan
            their Trips.
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium tracking-tight text-body transition-colors hover:bg-badge focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {selectedEvent ? selectedEvent.name : "All Events"}
              <ChevronDownIcon className="size-4" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[220px] max-w-[320px]">
            <DropdownMenuItem
              onSelect={() => setSelectedEventId(null)}
              className={`cursor-pointer ${selectedEventId === null ? "font-medium text-primary" : ""}`}
            >
              All Events
            </DropdownMenuItem>
            {events.map((e) => (
              <DropdownMenuItem
                key={e.id}
                onSelect={() => setSelectedEventId(e.id)}
                className={`cursor-pointer ${selectedEventId === e.id ? "font-medium text-primary" : ""}`}
              >
                {e.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        <EventMetrics label="Top Attendees" getData={attendeesData} />
        <EventMetrics label="Trips Planned" getData={tripsData} />
        <EventMetrics label="Bookings Made" getData={bookingsData} />
      </div>

      {/* Attendee Location — treemap of city/state names */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
        <div className="border-b border-border px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
            Attendee Location
          </h2>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          {hasLocationData ? (
            <ReactApexChart
              key={`treemap-${selectedEventId}`}
              type="treemap"
              height={320}
              options={buildTreemapOptions()}
              series={treemapSeries}
            />
          ) : (
            <NoData />
          )}
        </div>
      </div>

      {/* Top Locations + Top Itineraries */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
          <div className="border-b border-border px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
            <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
              Top Locations
            </h2>
          </div>
          <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            {hasLocationData ? (
              <ReactApexChart
                key={`bar-${locationLabels.join(",")}`}
                type="bar"
                height={260}
                options={buildBarOptions(locationLabels)}
                series={locationSeries}
              />
            ) : (
              <NoData />
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
          <div className="border-b border-border px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
            <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
              Top Itineraries
            </h2>
          </div>
          <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {hasItinData ? (
              <ReactApexChart
                key={`donut-${itinLabels.join(",")}`}
                type="donut"
                height={280}
                options={buildDonutOptions(itinLabels)}
                series={itinSeries}
              />
            ) : (
              <NoData />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
