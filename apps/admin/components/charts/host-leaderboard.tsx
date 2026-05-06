"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@runwae/ui/components/card";

type Row = {
  hostId: string;
  hostShareTotal: number;
  host: { _id: string; name: string | null; email: string | null } | null;
};

export function HostLeaderboardCard({ rows }: { rows: Row[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top hosts by earnings</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No host earnings yet.</p>
        ) : (
          <ol className="space-y-3">
            {rows.map((row, i) => (
              <li
                key={row.hostId}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-heading">
                      {row.host?.name ?? row.host?.email ?? "Unknown host"}
                    </p>
                    {row.host?.email && row.host.name && (
                      <p className="truncate text-xs text-muted-foreground">
                        {row.host.email}
                      </p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-heading">
                  £{row.hostShareTotal.toFixed(2)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
