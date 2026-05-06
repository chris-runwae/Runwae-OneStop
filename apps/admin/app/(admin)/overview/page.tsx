"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import {
  CalendarDays,
  Users,
  Wallet,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";
import { Skeleton } from "@runwae/ui/components/skeleton";
import { RevenueLineChart } from "@/components/charts/revenue-line";
import { HostLeaderboardCard } from "@/components/charts/host-leaderboard";

const DAY_MS = 86_400_000;

export default function OverviewPage() {
  const now = useMemo(() => Date.now(), []);
  const overview = useQuery(api.admin.analytics.getPlatformOverview, {});
  const timeseries = useQuery(api.admin.analytics.getRevenueTimeseries, {
    from: now - 30 * DAY_MS,
    to: now,
    bucket: "day",
  });
  const leaderboard = useQuery(api.admin.analytics.getHostLeaderboard, {
    limit: 10,
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Platform-wide health at a glance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Gross bookings (30d)"
          value={overview ? `£${overview.gmv.toFixed(0)}` : null}
          icon={Wallet}
          loading={overview === undefined}
        />
        <Kpi
          label="Bookings"
          value={overview ? `${overview.bookingCount}` : null}
          icon={TrendingUp}
          loading={overview === undefined}
        />
        <Kpi
          label="Hosts"
          value={overview ? `${overview.hostCount}` : null}
          icon={Users}
          loading={overview === undefined}
        />
        <Kpi
          label="Published events"
          value={
            overview
              ? `${overview.publishedEventCount} / ${overview.eventCount}`
              : null
          }
          icon={CalendarDays}
          loading={overview === undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue — last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            {timeseries === undefined ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <RevenueLineChart data={timeseries} />
            )}
          </CardContent>
        </Card>

        {leaderboard === undefined ? (
          <Card>
            <CardHeader>
              <CardTitle>Top hosts by earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ) : (
          <HostLeaderboardCard rows={leaderboard} />
        )}
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string | null;
  icon: LucideIcon;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-1 h-6 w-20" />
          ) : (
            <p className="mt-0.5 font-display text-xl font-semibold tabular-nums text-heading">
              {value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
