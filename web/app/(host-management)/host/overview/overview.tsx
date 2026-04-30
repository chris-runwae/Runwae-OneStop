"use client";

import { useAuth } from "@/context/AuthContext";
import {
  computeChange,
  filterByDateField,
  filterByPrevDateField,
  type Period,
} from "@/lib/period-utils";
import {
  getHostOverviewStats,
  type HostEventRow,
  type ItineraryItem,
} from "@/lib/supabase/events";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type PeriodData, EventMetrics } from "./components/event-metrics";
import { EventPerformanceChart } from "./components/event-performance-chart";

function makeViewsData(events: HostEventRow[]) {
  return (period: Period): PeriodData => {
    const current = filterByDateField(events, "start_date", period).reduce(
      (sum, e) => sum + (e.view_count ?? 0), 0,
    );
    const previous = filterByPrevDateField(events, "start_date", period).reduce(
      (sum, e) => sum + (e.view_count ?? 0), 0,
    );
    const { change, trend } = computeChange(current, previous, period);
    return { value: current.toLocaleString(), change, trend };
  };
}

function makeBookingsData(events: HostEventRow[]) {
  return (period: Period): PeriodData => {
    const current = filterByDateField(events, "start_date", period).reduce(
      (sum, e) => sum + (e.current_participants ?? 0), 0,
    );
    const previous = filterByPrevDateField(events, "start_date", period).reduce(
      (sum, e) => sum + (e.current_participants ?? 0), 0,
    );
    const { change, trend } = computeChange(current, previous, period);
    return { value: current.toLocaleString(), change, trend };
  };
}

function makeTripPlansData(items: ItineraryItem[]) {
  return (period: Period): PeriodData => {
    const current = filterByDateField(items, "created_at", period).length;
    const previous = filterByPrevDateField(items, "created_at", period).length;
    const { change, trend } = computeChange(current, previous, period);
    return { value: current.toLocaleString(), change, trend };
  };
}

export default function Overview() {
  const { user } = useAuth();
  const [events, setEvents] = useState<HostEventRow[]>([]);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);

  useEffect(() => {
    if (!user) return;
    getHostOverviewStats(user.id)
      .then((stats) => {
        setEvents(stats.events);
        setItineraryItems(stats.itineraryItems);
      })
      .catch((err: Error) =>
        toast.error(err.message ?? "Failed to load overview data"),
      );
  }, [user]);

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8 xl:p-10">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <EventMetrics label="Views" getData={makeViewsData(events)} />
        <EventMetrics label="Trip Plans" getData={makeTripPlansData(itineraryItems)} />
        <EventMetrics label="Bookings" getData={makeBookingsData(events)} />
        {/* Commission — commented out until data is available
        <EventMetrics label="Commission" getData={...} />
        */}
      </div>

      {/* Chart */}
      <EventPerformanceChart events={events} />
    </div>
  );
}
