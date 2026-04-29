"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ChevronLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { EventAdminPanel } from "@/components/events/event-admin-panel";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const eventId = id as Id<"events">;
  const event = useQuery(api.admin.events.getById, { id: eventId });

  return (
    <div className="space-y-6 p-8">
      <div>
        <Link
          href="/events"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" /> Back to events
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {event ? event.name : "Loading…"}
        </h1>
      </div>
      {event === undefined ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : event === null ? (
        <div className="rounded-md border border-border bg-background p-8 text-center text-sm text-muted-foreground">
          Event not found.
        </div>
      ) : (
        <EventAdminPanel event={event} />
      )}
    </div>
  );
}
