"use client";

import { eventDetail, ROUTES } from "@/app/routes";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { VIEW_MODES } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import { deleteEvent, getEvents, type Event } from "@/lib/supabase/events";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  ChevronDown,
  DollarSign,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { EventActionsMenu } from "./components/event-actions-menu";

type ViewMode = "column" | "grid";

const EVENT_FILTERS = ["All Events", "Published", "Upcoming"] as const;
type EventFilter = (typeof EVENT_FILTERS)[number];

export default function EventsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("column");
  const [activeFilter, setActiveFilter] = useState<EventFilter>("All Events");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["event-detail"] });
      await queryClient.invalidateQueries({ queryKey: ["event-row"] });
      toast.success("Event deleted.");
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not delete event.");
    },
  });

  const { data, isPending } = useQuery({
    queryKey: ["events", user?.id],
    queryFn: () => getEvents(user!.id),
    enabled: !!user,
  });

  if (!user) return null;

  const events = data ?? [];

  const now = new Date();
  const filteredEvents = events
    .filter((e) => {
      if (activeFilter === "Published") return e.status === "published";
      if (activeFilter === "Upcoming")
        return e.start_date ? new Date(e.start_date) > now : false;
      return true;
    })
    .filter((e) =>
      search ? e.name.toLowerCase().includes(search.toLowerCase()) : true,
    );

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <h1 className="font-display text-2xl font-bold text-black">
        Your Events
      </h1>

      {/* Controls bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-body focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {activeFilter}
                <ChevronDown
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-40">
              {EVENT_FILTERS.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onSelect={() => setActiveFilter(option)}
                  className={cn(
                    "cursor-pointer",
                    activeFilter === option && "font-medium text-primary",
                  )}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative flex-1 sm:max-w-60">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>

          <div className="flex rounded-lg border border-border bg-surface p-0.5">
            {VIEW_MODES.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setViewMode(value)}
                className={cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  viewMode === value
                    ? "bg-page text-black"
                    : "text-muted-foreground hover:text-body",
                )}
                aria-label={label}
                aria-pressed={viewMode === value}
              >
                <Icon className="size-4" aria-hidden />
              </button>
            ))}
          </div>
        </div>

        <Link
          href={ROUTES.host.eventsCreate}
          className={cn(
            buttonVariants({ variant: "primary", size: "default" }),
          )}
        >
          Create Event
        </Link>
      </div>

      {/* Loading */}
      {isPending && (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          Loading events…
        </div>
      )}

      {/* Content */}
      {!isPending && viewMode === "column" && (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-150">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "Event Name",
                  "Date",
                  "Location",
                  "Status",
                  "Bookings",
                  "Earnings",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-sm font-medium text-body"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-6 py-4 text-right text-sm font-medium text-body">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => {
                const { date } = event.start_date
                  ? formatDate(event.start_date)
                  : { date: "—" };
                const status = event.status ?? "draft";
                return (
                  <tr
                    key={event.id}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-6 py-4 font-medium text-black">
                      {event.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-body">{date}</td>
                    <td className="px-6 py-4 text-sm text-body">
                      {event.location ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
                          status === "published" &&
                            "bg-primary/10 text-primary",
                          status === "draft" &&
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-body">
                      {event.current_participants?.toLocaleString() ?? "0"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-body">
                      —
                    </td>
                    <td className="px-6 py-4 text-right">
                      <EventActionsMenu
                        id={event.id}
                        name={event.name}
                        onDelete={() => setDeleteTarget(event)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isPending && viewMode === "grid" && (
        <div className="flex gap-8">
          <div className="hidden w-22.5 shrink-0 flex-col pt-1 lg:flex">
            {filteredEvents.length > 0 &&
              filteredEvents[0].start_date &&
              (() => {
                const { monthLabel, dayNum, dayOfWeek } = formatDate(
                  filteredEvents[0].start_date!,
                );
                const suffix = ["1", "21", "31"].includes(dayNum)
                  ? "st"
                  : ["2", "22"].includes(dayNum)
                    ? "nd"
                    : ["3", "23"].includes(dayNum)
                      ? "rd"
                      : "th";
                return (
                  <div className="flex flex-col">
                    <span className="font-display text-lg font-bold leading-tight text-black">
                      {monthLabel}
                      <br />
                      {dayNum}
                    </span>
                    <span className="mt-1 text-sm text-muted-foreground">
                      {dayNum}
                      {suffix}{" "}
                      {new Date(
                        filteredEvents[0].start_date!,
                      ).toLocaleDateString("en-US", { month: "long" })}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {dayOfWeek}
                    </span>
                  </div>
                );
              })()}
          </div>

          <div className="min-w-0 flex-1 space-y-6">
            {filteredEvents.map((event) => {
              const { time } = event.start_date
                ? formatDate(event.start_date)
                : { time: "—" };
              const status = event.status ?? "draft";
              return (
                <div
                  key={event.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm sm:flex-row"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded px-2 py-1 text-xs font-semibold uppercase",
                          status === "published" &&
                            "bg-primary/10 text-primary",
                          status === "draft" &&
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {status}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-black">
                      {event.name}
                    </h3>
                    <div className="flex flex-col gap-2 text-sm text-body">
                      <span className="flex items-center gap-2">
                        <Calendar
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        {time}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        {event.location ?? "—"}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        {event.view_count?.toLocaleString() ?? "0"} views
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        {event.current_participants?.toLocaleString() ?? "0"} bookings
                      </span>
                      <span className="flex items-center gap-2">
                        <DollarSign
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        —
                      </span>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      <Link
                        href={eventDetail(event.id)}
                        className={cn(
                          buttonVariants({
                            variant: "primary",
                            size: "default",
                          }),
                        )}
                      >
                        Manage Event
                      </Link>
                      <EventActionsMenu
                        id={event.id}
                        name={event.name}
                        onDelete={() => setDeleteTarget(event)}
                      />
                    </div>
                  </div>
                  {event.image && (
                    <div className="relative h-48 w-full shrink-0 bg-muted sm:h-40 sm:w-48">
                      <Image
                        src={event.image}
                        alt={event.name}
                        fill
                        className="object-cover"
                        sizes="192px"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isPending && filteredEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 py-16">
          <p className="text-muted-foreground">
            {search || activeFilter !== "All Events"
              ? "No events match your search or filters."
              : "You haven't created any events yet."}
          </p>
          <Link
            href={ROUTES.host.eventsCreate}
            className={cn(
              buttonVariants({ variant: "primary", size: "default" }),
            )}
          >
            Create Event
          </Link>
        </div>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete event</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
              )}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "border-destructive/50 text-destructive hover:bg-destructive/10",
              )}
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
