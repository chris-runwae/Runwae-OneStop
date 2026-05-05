"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ChevronLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DestinationForm } from "@/components/destinations/destination-form";

export default function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const destinationId = id as Id<"destinations">;
  const destination = useQuery(api.admin.destinations.getById, {
    id: destinationId,
  });

  return (
    <div className="space-y-6 p-8">
      <div>
        <Link
          href="/destinations"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" /> Back to destinations
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {destination ? destination.name : "Loading…"}
        </h1>
        {destination?.deletedAt && (
          <p className="mt-1 text-xs text-destructive">
            Soft-deleted on{" "}
            {new Date(destination.deletedAt).toLocaleString()}.
          </p>
        )}
      </div>
      {destination === undefined ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : destination === null ? (
        <div className="rounded-md border border-border bg-background p-8 text-center text-sm text-muted-foreground">
          Destination not found.
        </div>
      ) : (
        <DestinationForm mode="edit" initial={destination} />
      )}
    </div>
  );
}
