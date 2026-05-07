"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  Eye,
  ImageIcon,
  MapPin,
  Pencil,
  Users,
} from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@runwae/ui/components/tabs";

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
          <Skeleton className="aspect-[16/6] w-full rounded-2xl" />
          <Skeleton className="h-8 w-64" />
        </div>
      ) : event === null ? (
        <p className="text-sm text-muted-foreground">Event not found.</p>
      ) : (
        <>
          {/* Hero with cover image */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
            {event.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.imageUrl}
                alt={event.name}
                className="aspect-[16/6] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/6] w-full items-center justify-center text-muted-foreground">
                <ImageIcon className="size-10" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 py-5 sm:px-8 sm:py-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[event.status]}>
                      {event.status}
                    </Badge>
                    {event.category && (
                      <Badge variant="secondary" className="capitalize">
                        {event.category}
                      </Badge>
                    )}
                  </div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {event.name}
                  </h1>
                  <p className="flex items-center gap-3 text-sm text-white/80">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {event.locationName}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {new Date(event.startDateUtc).toLocaleDateString(
                        undefined,
                        { dateStyle: "medium" }
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {new Date(event.startDateUtc).toLocaleTimeString(
                        undefined,
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                  >
                    <Link href={`/events/${event._id}/edit`}>
                      <Pencil className="size-3.5" />
                      Edit
                    </Link>
                  </Button>
                  {event.status === "draft" && (
                    <Button size="sm" onClick={onPublish}>
                      Publish
                    </Button>
                  )}
                  {event.status === "published" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={onUnpublish}
                    >
                      Unpublish
                    </Button>
                  )}
                  {event.status !== "cancelled" &&
                    event.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={onCancel}
                      >
                        Cancel
                      </Button>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="guests">Guests</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>About this event</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-body">
                    {event.description ? (
                      <p className="whitespace-pre-wrap">{event.description}</p>
                    ) : (
                      <p className="text-muted-foreground">
                        No description yet.
                      </p>
                    )}
                    <dl className="grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                      <DetailRow label="Timezone" value={event.timezone} />
                      <DetailRow
                        label="Ends"
                        value={
                          event.endDateUtc
                            ? new Date(event.endDateUtc).toLocaleString()
                            : "—"
                        }
                      />
                      <DetailRow
                        label="Ticketing"
                        value={
                          event.ticketingMode === "external"
                            ? "External URL"
                            : event.ticketingMode === "runwae"
                            ? "Runwae"
                            : event.ticketingMode === "free"
                            ? "Free / RSVP"
                            : "None"
                        }
                      />
                      <DetailRow
                        label="Coordinates"
                        value={
                          event.locationCoords
                            ? `${event.locationCoords.lat.toFixed(4)}, ${event.locationCoords.lng.toFixed(4)}`
                            : "—"
                        }
                      />
                    </dl>
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
                        <Stat
                          label="Views"
                          value={insights.viewCount}
                          icon={<Eye className="size-3.5" />}
                        />
                        <Stat
                          label="Going"
                          value={insights.funnel.going}
                          icon={<Users className="size-3.5" />}
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
            </TabsContent>

            <TabsContent value="guests">
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Guest list and co-host management coming soon.
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Booking breakdown is on the dedicated{" "}
                  <Link href="/bookings" className="text-primary underline">
                    Bookings page
                  </Link>
                  .
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faqs">
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  FAQs coming soon.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-body">{value}</dd>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-display text-lg font-semibold tabular-nums text-heading">
        {value}
      </span>
    </div>
  );
}
