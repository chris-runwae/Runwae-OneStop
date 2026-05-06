"use client";

import { useState } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";
import { Skeleton } from "@runwae/ui/components/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@runwae/ui/components/select";

export default function AttendeeInsightsPage() {
  const { results: events, status: pageStatus } = usePaginatedQuery(
    api.host.events.getMyEvents,
    {},
    { initialNumItems: 100 }
  );

  const [selectedId, setSelectedId] = useState<Id<"events"> | null>(null);
  const insights = useQuery(
    api.host.analytics.getEventInsights,
    selectedId ? { eventId: selectedId } : "skip"
  );

  const activeId = selectedId ?? (events[0]?._id as Id<"events"> | undefined);
  const activeInsights = activeId === selectedId ? insights : null;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
            Attendee insights
          </h1>
          <p className="text-sm text-muted-foreground">
            RSVP and ticket funnel for each event you host.
          </p>
        </div>
        {events.length > 0 && (
          <Select
            value={activeId ?? ""}
            onValueChange={(v) => setSelectedId(v as Id<"events">)}
          >
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Pick an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e._id} value={e._id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {pageStatus === "LoadingFirstPage" ? (
        <Skeleton className="h-64 w-full" />
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
            Create an event first — we'll surface attendee analytics here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>RSVP funnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {activeInsights === undefined || activeInsights === null ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <>
                  <Stat label="Views" value={activeInsights.viewCount} />
                  <Stat
                    label="Interested"
                    value={activeInsights.funnel.interested}
                  />
                  <Stat label="Going" value={activeInsights.funnel.going} />
                  <Stat
                    label="Not going"
                    value={activeInsights.funnel.notGoing}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {activeInsights === undefined || activeInsights === null ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <>
                  <Stat label="Total" value={activeInsights.tickets.total} />
                  <Stat
                    label="Active"
                    value={activeInsights.tickets.active}
                  />
                  <Stat label="Used" value={activeInsights.tickets.used} />
                  <Stat
                    label="Cancelled"
                    value={activeInsights.tickets.cancelled}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-display text-lg font-semibold tabular-nums text-heading">
        {value}
      </span>
    </div>
  );
}
