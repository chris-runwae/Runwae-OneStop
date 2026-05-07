"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@runwae/ui/components/skeleton";
import {
  EventForm,
  type EventFormSubmitPayload,
} from "@/components/events/event-form";

function toLocalInput(ms: number) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const eventId = id as Id<"events">;
  const router = useRouter();
  const event = useQuery(api.host.events.getMyEventById, { id: eventId });
  const update = useMutation(api.host.events.updateEvent);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(payload: EventFormSubmitPayload) {
    setSubmitting(true);
    try {
      await update({
        eventId,
        name: payload.name,
        description: payload.description,
        locationName: payload.locationName,
        locationCoords: payload.locationCoords,
        timezone: payload.timezone,
        startDateUtc: payload.startDateUtc,
        endDateUtc: payload.endDateUtc,
        category: payload.category,
        imageUrl: payload.imageUrl,
        ticketingMode: payload.ticketingMode,
        externalTicketUrl: payload.externalTicketUrl,
      });
      toast.success("Saved");
      router.replace(`/events/${eventId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Link
        href={`/events/${eventId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-heading"
      >
        <ChevronLeft className="size-4" />
        Back to event
      </Link>

      <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
        Edit event
      </h1>

      {event === undefined ? (
        <Skeleton className="h-96 w-full" />
      ) : event === null ? (
        <p className="text-sm text-muted-foreground">Event not found.</p>
      ) : (
        <EventForm
          mode="edit"
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          initial={{
            name: event.name,
            description: event.description ?? "",
            locationName: event.locationName,
            locationCoords: event.locationCoords ?? null,
            timezone: event.timezone,
            startLocal: toLocalInput(event.startDateUtc),
            endLocal: event.endDateUtc ? toLocalInput(event.endDateUtc) : "",
            category: event.category ?? "",
            imageUrl: event.imageUrl ?? "",
            ticketingMode: event.ticketingMode,
            externalTicketUrl: event.externalTicketUrl ?? "",
          }}
        />
      )}
    </div>
  );
}
