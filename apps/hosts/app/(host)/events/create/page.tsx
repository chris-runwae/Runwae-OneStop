"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "convex/react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import {
  EventForm,
  type EventFormSubmitPayload,
} from "@/components/events/event-form";

export default function CreateEventPage() {
  const router = useRouter();
  const createEvent = useMutation(api.host.events.createEvent);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(payload: EventFormSubmitPayload) {
    setSubmitting(true);
    try {
      const result = await createEvent({
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
      toast.success("Event created as draft");
      if (result) router.replace(`/events/${result._id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-heading"
      >
        <ChevronLeft className="size-4" />
        All events
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
          New event
        </h1>
      </div>

      <EventForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/events")}
        submitting={submitting}
      />
    </div>
  );
}
