"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import {
  CalendarDays,
  TrendingUp,
  Users,
  Eye,
  Wallet,
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
import { Button } from "@runwae/ui/components/button";

export default function HostOverviewPage() {
  const overview = useQuery(api.host.analytics.getMyOverview, {});
  const earnings = useQuery(api.commissions.getHostEarnings, {});

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Pending earnings"
          value={
            earnings
              ? `£${earnings.pending.toFixed(2)}`
              : null
          }
          icon={Wallet}
          loading={earnings === undefined}
          accent
        />
        <Kpi
          label="Upcoming events"
          value={overview ? `${overview.upcomingEvents}` : null}
          icon={CalendarDays}
          loading={overview === undefined}
        />
        <Kpi
          label="Going attendees"
          value={overview ? `${overview.totalParticipants}` : null}
          icon={Users}
          loading={overview === undefined}
        />
        <Kpi
          label="Total views"
          value={overview ? `${overview.totalViews}` : null}
          icon={Eye}
          loading={overview === undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Get started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              {overview?.eventCount === 0
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

function Kpi({
  label,
  value,
  icon: Icon,
  loading,
  accent,
}: {
  label: string;
  value: string | null;
  icon: LucideIcon;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className={`flex size-10 items-center justify-center rounded-lg ${
            accent ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
          }`}
        >
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
