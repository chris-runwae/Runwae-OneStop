"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { ChevronLeft, Pencil } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id, Doc } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";
import { Button } from "@runwae/ui/components/button";
import { Skeleton } from "@runwae/ui/components/skeleton";
import { Badge } from "@runwae/ui/components/badge";

const STATUS_VARIANT: Record<
  Doc<"events">["status"],
  "default" | "secondary" | "destructive" | "success" | "outline"
> = {
  draft: "outline",
  published: "success",
  cancelled: "destructive",
  completed: "secondary",
};

export default function HostEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const eventId = id as Id<"events">;

  const event = useQuery(api.host.events.getMyEventById, { id: eventId });
  const insights = useQuery(api.host.analytics.getEventInsights, {
    eventId,
  });
  const setStatus = useMutation(api.host.events.setStatus);
  const cancel = useMutation(api.host.events.deleteEvent);

  const onPublish = async () => {
    try {
      await setStatus({ eventId, status: "published" });
      toast.success("Event published");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const onUnpublish = async () => {
    try {
      await setStatus({ eventId, status: "draft" });
      toast.success("Reverted to draft");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const onCancel = async () => {
    if (!confirm("Cancel this event? This can't be reverted.")) return;
    try {
      await cancel({ eventId });
      toast.success("Event cancelled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-heading"
      >
        <ChevronLeft className="size-4" />
        All events
      </Link>

      {event === undefined ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : event === null ? (
        <p className="text-sm text-muted-foreground">Event not found.</p>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
                  {event.name}
                </h1>
                <Badge variant={STATUS_VARIANT[event.status]}>
                  {event.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {event.locationName} · {new Date(event.startDateUtc).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="gap-1.5">
                <Link href={`/events/${event._id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
              {event.status === "draft" && (
                <Button onClick={onPublish}>Publish</Button>
              )}
              {event.status === "published" && (
                <Button variant="outline" onClick={onUnpublish}>
                  Unpublish
                </Button>
              )}
              {event.status !== "cancelled" &&
                event.status !== "completed" && (
                  <Button variant="destructive" onClick={onCancel}>
                    Cancel event
                  </Button>
                )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {event.description ? (
                  <p className="whitespace-pre-wrap text-sm text-body">
                    {event.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No description yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {insights === undefined ? (
                  <Skeleton className="h-32 w-full" />
                ) : insights === null ? (
                  <p className="text-muted-foreground">No insights yet.</p>
                ) : (
                  <>
                    <Stat label="Views" value={insights.viewCount} />
                    <Stat
                      label="Going"
                      value={insights.funnel.going}
                    />
                    <Stat
                      label="Interested"
                      value={insights.funnel.interested}
                    />
                    <Stat
                      label="Tickets sold"
                      value={insights.tickets.total}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </>
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
