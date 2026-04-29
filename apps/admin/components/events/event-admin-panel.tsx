"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { Flame, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type EventStatus = Doc<"events">["status"];

type EventDetail = Doc<"events"> & {
  host: { _id: Id<"users">; name: string | null; email: string | null } | null;
  destination: { _id: Id<"destinations">; name: string } | null;
};

const STATUS_OPTIONS: EventStatus[] = ["draft", "published", "cancelled", "completed"];

const STATUS_LABEL: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  cancelled: "Cancelled",
  completed: "Completed",
};

// Mirrors the server-side ALLOWED_TRANSITIONS so the dropdown only offers
// transitions the mutation will actually accept. Self-transitions are
// always present so the current value renders.
const ALLOWED_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ["draft", "published", "cancelled"],
  published: ["published", "cancelled", "completed"],
  cancelled: ["cancelled"],
  completed: ["completed"],
};

const AUTOSAVE_DELAY_MS = 800;

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

function errorMessage(e: unknown): string {
  if (e instanceof ConvexError) return String(e.data ?? e.message);
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

export function EventAdminPanel({ event }: { event: EventDetail }) {
  const setStatus = useMutation(api.admin.events.setStatus);
  const setTrending = useMutation(api.admin.events.setTrending);
  const updateAdminNotes = useMutation(api.admin.events.updateAdminNotes);

  const [statusValue, setStatusValue] = useState<EventStatus>(event.status);
  const [statusBusy, setStatusBusy] = useState(false);
  const [trendingValue, setTrendingValue] = useState<boolean>(
    event.isTrending ?? false
  );
  const [trendingRank, setTrendingRank] = useState<string>(
    event.trendingRank?.toString() ?? ""
  );
  const [adminNotes, setAdminNotes] = useState<string>(event.adminNotes ?? "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Re-sync local state whenever the parent query refetches with a new
  // record (e.g. after our own mutation). Keep the textarea controlled by
  // the user mid-typing — only resync on id change.
  const lastIdRef = useRef<Id<"events"> | null>(event._id);
  useEffect(() => {
    if (lastIdRef.current !== event._id) {
      lastIdRef.current = event._id;
      setStatusValue(event.status);
      setTrendingValue(event.isTrending ?? false);
      setTrendingRank(event.trendingRank?.toString() ?? "");
      setAdminNotes(event.adminNotes ?? "");
      setSaveStatus("idle");
    }
  }, [event._id, event.status, event.isTrending, event.trendingRank, event.adminNotes]);

  // Debounced auto-save for adminNotes only — status and trending are
  // explicit user actions so they save immediately.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function scheduleNotesSave(next: string) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("dirty");
    saveTimer.current = setTimeout(() => {
      void runNotesSave(next);
    }, AUTOSAVE_DELAY_MS);
  }

  async function runNotesSave(next: string) {
    if (inFlightRef.current) {
      pendingRef.current = true;
      return;
    }
    inFlightRef.current = true;
    setSaveStatus("saving");
    try {
      await updateAdminNotes({ eventId: event._id, adminNotes: next });
      setSaveStatus("saved");
    } catch (e) {
      setSaveStatus("error");
      toast.error(errorMessage(e));
    } finally {
      inFlightRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        await runNotesSave(adminNotes);
      }
    }
  }

  async function handleStatusChange(next: EventStatus) {
    if (next === statusValue) return;
    const prev = statusValue;
    setStatusValue(next);
    setStatusBusy(true);
    try {
      await setStatus({ eventId: event._id, status: next });
      toast.success(`Status set to ${STATUS_LABEL[next]}`);
    } catch (e) {
      setStatusValue(prev);
      toast.error(errorMessage(e));
    } finally {
      setStatusBusy(false);
    }
  }

  async function handleTrendingToggle(next: boolean) {
    const prev = trendingValue;
    setTrendingValue(next);
    try {
      const rankNum = trendingRank ? Number(trendingRank) : undefined;
      const rankPayload =
        next && rankNum !== undefined && Number.isFinite(rankNum) && rankNum >= 0
          ? rankNum
          : undefined;
      await setTrending({
        eventId: event._id,
        isTrending: next,
        trendingRank: rankPayload,
      });
      toast.success(next ? "Marked trending" : "Removed from trending");
    } catch (e) {
      setTrendingValue(prev);
      toast.error(errorMessage(e));
    }
  }

  async function handleRankCommit() {
    if (!trendingValue) return;
    const rankNum = trendingRank ? Number(trendingRank) : undefined;
    if (
      rankNum !== undefined &&
      (!Number.isFinite(rankNum) || rankNum < 0)
    ) {
      toast.error("Rank must be a non-negative number");
      setTrendingRank(event.trendingRank?.toString() ?? "");
      return;
    }
    if (rankNum === event.trendingRank) return;
    try {
      await setTrending({
        eventId: event._id,
        isTrending: true,
        trendingRank: rankNum,
      });
      toast.success("Rank saved");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[event.status];
  const heroUrl = event.imageUrl ?? event.imageUrls[0];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* LEFT — host-owned read-only fields */}
      <div className="space-y-6 lg:col-span-2">
        <Section
          title="Host-owned details"
          subtitle="Read-only here. Edits happen on the host side."
        >
          {heroUrl && (
            <div className="relative h-48 w-full overflow-hidden rounded-md bg-muted">
              <Image
                src={heroUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 600px"
                unoptimized
              />
            </div>
          )}
          <ReadField label="Name" value={event.name} />
          <ReadField label="Slug" value={event.slug} mono />
          <ReadField
            label="Description"
            value={event.description ?? "—"}
            multiline
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadField label="Location" value={event.locationName} />
            <ReadField label="Timezone" value={event.timezone} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadField
              label="Starts"
              value={new Date(event.startDateUtc).toLocaleString("en-GB", {
                timeZone: event.timezone,
                dateStyle: "medium",
                timeStyle: "short",
              })}
            />
            <ReadField
              label="Ends"
              value={
                event.endDateUtc
                  ? new Date(event.endDateUtc).toLocaleString("en-GB", {
                      timeZone: event.timezone,
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <ReadField label="Category" value={event.category ?? "—"} />
            <ReadField label="Ticketing" value={event.ticketingMode} />
            <ReadField
              label="Going"
              value={String(event.currentParticipants)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadField
              label="Host"
              value={
                event.host
                  ? `${event.host.name ?? "—"}${event.host.email ? ` · ${event.host.email}` : ""}`
                  : "—"
              }
            />
            <ReadField
              label="Destination"
              value={event.destination?.name ?? "—"}
            />
          </div>
        </Section>

        <Section
          title="Internal admin notes"
          subtitle="Never visible to hosts or attendees. Auto-saves after 800ms."
        >
          <Textarea
            rows={6}
            value={adminNotes}
            onChange={(e) => {
              setAdminNotes(e.target.value);
              scheduleNotesSave(e.target.value);
            }}
            placeholder="Why this event was flagged, host context, ops notes…"
          />
          <div className="flex items-center justify-end text-xs text-muted-foreground">
            <SaveStatusPill status={saveStatus} />
          </div>
        </Section>
      </div>

      {/* RIGHT — admin curation controls */}
      <div className="space-y-6">
        <Section title="Status">
          <div className="space-y-2">
            <Label className="text-xs">Set status</Label>
            <select
              value={statusValue}
              onChange={(e) => void handleStatusChange(e.target.value as EventStatus)}
              disabled={statusBusy}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((s) => (
                <option
                  key={s}
                  value={s}
                  disabled={!allowedNextStatuses.includes(s)}
                >
                  {STATUS_LABEL[s]}
                  {!allowedNextStatuses.includes(s) ? " (locked)" : ""}
                </option>
              ))}
            </select>
            {(event.status === "cancelled" || event.status === "completed") && (
              <p className="text-xs text-muted-foreground">
                Terminal status — further changes require a DB intervention.
              </p>
            )}
            {(statusValue === "cancelled" || statusValue === "completed") &&
              statusValue !== event.status && (
                <p className="text-xs text-muted-foreground">
                  Host will be notified by email.
                </p>
              )}
          </div>
        </Section>

        <Section title="Trending">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="trending" className="flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4" />
              Mark trending
            </Label>
            <Switch
              id="trending"
              checked={trendingValue}
              onCheckedChange={(c) => void handleTrendingToggle(c)}
            />
          </div>
          {trendingValue && (
            <div className="space-y-1.5">
              <Label className="text-xs">Rank (lower = earlier)</Label>
              <Input
                value={trendingRank}
                onChange={(e) => setTrendingRank(e.target.value)}
                onBlur={() => void handleRankCommit()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleRankCommit();
                  }
                }}
                placeholder="auto"
                inputMode="numeric"
              />
            </div>
          )}
        </Section>

        <Section title="Counts">
          <div className="space-y-2 text-sm">
            <Row label="Views" value={event.viewCount} />
            <Row label="Going" value={event.currentParticipants} />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-background p-5">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ReadField({
  label,
  value,
  multiline,
  mono,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div
        className={
          multiline
            ? "whitespace-pre-wrap rounded-md border border-input bg-muted/30 px-3 py-2 text-sm"
            : `flex h-9 items-center rounded-md border border-input bg-muted/30 px-3 text-sm ${
                mono ? "font-mono text-xs" : ""
              }`
        }
      >
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant="outline">{value}</Badge>
    </div>
  );
}

function SaveStatusPill({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  if (status === "dirty") return <span>Pending…</span>;
  if (status === "saving")
    return (
      <span className="inline-flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  if (status === "saved") return <span>Saved ✓</span>;
  return <span className="text-destructive">Save failed</span>;
}
