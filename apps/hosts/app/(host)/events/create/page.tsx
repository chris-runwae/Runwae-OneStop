"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@runwae/ui/components/select";

const TICKETING_MODES: {
  value: "runwae" | "external" | "free" | "none";
  label: string;
}[] = [
  { value: "runwae", label: "Runwae ticketing" },
  { value: "external", label: "External ticket URL" },
  { value: "free", label: "Free / RSVP only" },
  { value: "none", label: "No ticketing" },
];

export default function CreateEventPage() {
  const router = useRouter();
  const createEvent = useMutation(api.host.events.createEvent);

  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [timezone, setTimezone] = useState("Europe/London");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ticketingMode, setTicketingMode] = useState<
    "runwae" | "external" | "free" | "none"
  >("free");
  const [externalTicketUrl, setExternalTicketUrl] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startLocal) {
      toast.error("Pick a start date and time");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createEvent({
        name,
        description: description.trim() || undefined,
        locationName,
        timezone,
        startDateUtc: new Date(startLocal).getTime(),
        endDateUtc: endLocal ? new Date(endLocal).getTime() : undefined,
        category: category.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        ticketingMode,
        externalTicketUrl:
          ticketingMode === "external"
            ? externalTicketUrl.trim() || undefined
            : undefined,
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

      <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
        New event
      </h1>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Event name</Label>
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
                placeholder="Shoreditch, London"
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
              <Label htmlFor="timezone">Timezone (IANA)</Label>
              <Input
                id="timezone"
                required
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Europe/London"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="music, food, …"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cover">Cover image URL</Label>
              <Input
                id="cover"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ticketing</Label>
              <Select
                value={ticketingMode}
                onValueChange={(v) =>
                  setTicketingMode(
                    v as "runwae" | "external" | "free" | "none"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKETING_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {ticketingMode === "external" && (
              <div className="space-y-1.5">
                <Label htmlFor="externalUrl">External ticket URL</Label>
                <Input
                  id="externalUrl"
                  type="url"
                  value={externalTicketUrl}
                  onChange={(e) => setExternalTicketUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Creating…" : "Create as draft"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You can publish from the event page.
            </p>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
