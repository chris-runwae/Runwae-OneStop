"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";
import { Skeleton } from "@runwae/ui/components/skeleton";

export default function HostEarningsPage() {
  const earnings = useQuery(api.commissions.getHostEarnings, {});
  const breakdown = useQuery(api.commissions.getHostEventBreakdown, {});

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
          Earnings
        </h1>
        <p className="text-sm text-muted-foreground">
          Your commission earnings, broken down by event.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Pending"
          value={earnings?.pending}
          loading={earnings === undefined}
        />
        <KpiCard
          label="Held (in payout)"
          value={earnings?.held}
          loading={earnings === undefined}
        />
        <KpiCard
          label="Paid"
          value={earnings?.paid}
          loading={earnings === undefined}
          accent
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>By event</CardTitle>
        </CardHeader>
        <CardContent>
          {breakdown === undefined ? (
            <Skeleton className="h-32 w-full" />
          ) : breakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No earnings recorded yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {breakdown.map((b, i) => (
                <li
                  key={`${b.eventId ?? "no-event"}-${i}`}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-heading">
                      {b.eventName ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pending {b.pending.toFixed(2)} · Held {b.held.toFixed(2)} · Paid {b.paid.toFixed(2)}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-heading">
                    {b.total.toFixed(2)} {b.currency}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
  loading,
  accent,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-32" />
        ) : (
          <p
            className={`mt-1 font-display text-2xl font-semibold tabular-nums ${
              accent ? "text-primary" : "text-heading"
            }`}
          >
            £{(value ?? 0).toFixed(2)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
