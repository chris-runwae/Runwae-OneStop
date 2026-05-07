"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { TrendingUp, Wallet } from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";
import { Skeleton } from "@runwae/ui/components/skeleton";
import { Button } from "@runwae/ui/components/button";
import { EventMetrics } from "@/components/overview/event-metrics";
import { EventPerformanceChart } from "@/components/overview/event-performance-chart";
import { computeChange, type Period } from "@/lib/period-utils";

export default function HostOverviewPage() {
  const [viewsPeriod, setViewsPeriod] = useState<Period>("this_month");
  const [tripsPeriod, setTripsPeriod] = useState<Period>("this_month");
  const [bookingsPeriod, setBookingsPeriod] = useState<Period>("this_month");

  const viewsTrends = useQuery(api.host.analytics.getMyOverviewWithTrends, {
    period: viewsPeriod,
  });
  const tripsTrends = useQuery(api.host.analytics.getMyOverviewWithTrends, {
    period: tripsPeriod,
  });
  const bookingsTrends = useQuery(api.host.analytics.getMyOverviewWithTrends, {
    period: bookingsPeriod,
  });

  const earnings = useQuery(api.commissions.getHostEarnings, {});
  const viewsCard = trendCard(viewsTrends, "views", viewsPeriod);
  const tripsCard = trendCard(tripsTrends, "tripPlans", tripsPeriod);
  const bookingsCard = trendCard(bookingsTrends, "bookings", bookingsPeriod);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
          Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Your event performance at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <EventMetrics
          label="Views"
          value={viewsCard.value}
          change={viewsCard.change}
          trend={viewsCard.trend}
          period={viewsPeriod}
          onPeriodChange={setViewsPeriod}
        />
        <EventMetrics
          label="Trip Plans"
          value={tripsCard.value}
          change={tripsCard.change}
          trend={tripsCard.trend}
          period={tripsPeriod}
          onPeriodChange={setTripsPeriod}
        />
        <EventMetrics
          label="Bookings"
          value={bookingsCard.value}
          change={bookingsCard.change}
          trend={bookingsCard.trend}
          period={bookingsPeriod}
          onPeriodChange={setBookingsPeriod}
        />
      </div>

      <EventPerformanceChart />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-4 text-primary" />
              Get started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              {viewsTrends?.eventCount === 0
                ? "Create your first event to start tracking performance and revenue."
                : "Manage your existing events or publish a new one."}
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/events/create">New event</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/events">View all events</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Lifetime earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {earnings === undefined ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="font-display text-3xl font-semibold tabular-nums text-heading">
                £{(earnings.pending + earnings.paid + earnings.held).toFixed(2)}
              </p>
            )}
            {earnings && (
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                <li>Paid: £{earnings.paid.toFixed(2)}</li>
                <li>Pending: £{earnings.pending.toFixed(2)}</li>
                <li>Held: £{earnings.held.toFixed(2)}</li>
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type TrendsCard = {
  value: string;
  change: string;
  trend: "up" | "down";
};

type Trends = {
  cards: {
    views: { current: number; previous: number };
    bookings: { current: number; previous: number };
    tripPlans: { current: number; previous: number };
  };
} | undefined;

function trendCard(
  data: Trends,
  key: "views" | "bookings" | "tripPlans",
  period: Period
): TrendsCard {
  if (!data) {
    return { value: "—", change: "", trend: "up" };
  }
  const card = data.cards[key];
  const change = computeChange(card.current, card.previous, period);
  return {
    value: card.current.toLocaleString(),
    change: change.change,
    trend: change.trend,
  };
}
