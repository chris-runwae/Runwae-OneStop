"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ChevronLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";
import { Skeleton } from "@runwae/ui/components/skeleton";
import { Badge } from "@runwae/ui/components/badge";

export default function HostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const hostId = id as Id<"users">;
  const user = useQuery(api.admin.users.getById, { id: hostId });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Link
        href="/hosts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-heading"
      >
        <ChevronLeft className="size-4" />
        All hosts
      </Link>

      {user === undefined ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : user === null ? (
        <p className="text-sm text-muted-foreground">Host not found.</p>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
                {user.name ?? user.email ?? "Unnamed host"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {user.email}
                {user.username && (
                  <span className="ml-2">@{user.username}</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {user.isHost && <Badge>Host</Badge>}
              {user.isAdmin && <Badge variant="secondary">Admin</Badge>}
              {user.suspendedAt && (
                <Badge variant="destructive">Suspended</Badge>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="User ID" value={user._id} />
                <Row label="Plan" value={user.plan ?? "free"} />
                <Row
                  label="Currency"
                  value={user.preferredCurrency ?? "GBP"}
                />
                <Row
                  label="Stripe Connect"
                  value={user.stripeConnectId ?? "—"}
                />
                <Row
                  label="Joined"
                  value={
                    user.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : "—"
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suspension</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {user.suspendedAt ? (
                  <>
                    <Row
                      label="Suspended at"
                      value={new Date(user.suspendedAt).toLocaleString()}
                    />
                    <Row
                      label="Reason"
                      value={user.suspensionReason ?? "—"}
                    />
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Account is in good standing.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-mono text-xs text-heading">{value}</span>
    </div>
  );
}
