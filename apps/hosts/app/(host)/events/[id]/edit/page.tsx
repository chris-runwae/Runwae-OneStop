"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@runwae/ui/components/button";
import { Input } from "@runwae/ui/components/input";
import { Label } from "@runwae/ui/components/label";
import { Textarea } from "@runwae/ui/components/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";
import { Skeleton } from "@runwae/ui/components/skeleton";

function toLocalInput(ms: number) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setName(event.name);
      setDescription(event.description ?? "");
      setLocationName(event.locationName);
      setTimezone(event.timezone);
      setStartLocal(toLocalInput(event.startDateUtc));
      setEndLocal(event.endDateUtc ? toLocalInput(event.endDateUtc) : "");
      setImageUrl(event.imageUrl ?? "");
    }
  }, [event]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startLocal) {
      toast.error("Pick a start date and time");
      return;
    }
    setSubmitting(true);
    try {
      await update({
        eventId,
        name,
        description: description.trim() || undefined,
        locationName,
        timezone,
        startDateUtc: new Date(startLocal).getTime(),
        endDateUtc: endLocal ? new Date(endLocal).getTime() : undefined,
        imageUrl: imageUrl.trim() || undefined,
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
        <form onSubmit={onSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[140px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="start">Starts</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    required
                    value={startLocal}
                    onChange={(e) => setStartLocal(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end">Ends (optional)</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={endLocal}
                    onChange={(e) => setEndLocal(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tz">Timezone (IANA)</Label>
                <Input
                  id="tz"
                  required
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cover">Cover image URL</Label>
                <Input
                  id="cover"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
