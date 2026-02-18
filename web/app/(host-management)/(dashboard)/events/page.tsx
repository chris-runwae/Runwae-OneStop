"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronDown,
  DollarSign,
  LayoutGrid,
  List,
  MapPin,
  MoreVertical,
  Search,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type ViewMode = "column" | "grid";

interface EventItem {
  id: string;
  name: string;
  date: string;
  dayOfWeek: string;
  monthLabel: string;
  dayNum: string;
  time: string;
  location: string;
  status: "published" | "draft" | "stripe";
  statusLabel: string;
  views: number;
  bookings: number;
  earnings: string;
  imageUrl: string;
}

const mockEvents: EventItem[] = [
  {
    id: "1",
    name: "TechBurst",
    date: "Oct 14, 2026",
    dayOfWeek: "Friday",
    monthLabel: "JAN",
    dayNum: "25",
    time: "9:00 - 11:00",
    location: "Landmark, Lagos",
    status: "published",
    statusLabel: "PUBLISHED",
    views: 234,
    bookings: 123,
    earnings: "$500.78",
    imageUrl: "/logo-dark.png",
  },
  {
    id: "2",
    name: "TechBurst",
    date: "Oct 14, 2026",
    dayOfWeek: "Friday",
    monthLabel: "JAN",
    dayNum: "25",
    time: "9:00 - 11:00",
    location: "Landmark, Lagos",
    status: "published",
    statusLabel: "PUBLISHED",
    views: 234,
    bookings: 123,
    earnings: "$500.78",
    imageUrl: "/logo-dark.png",
  },
  {
    id: "3",
    name: "Techburst",
    date: "Oct 14, 2026",
    dayOfWeek: "Friday",
    monthLabel: "JAN",
    dayNum: "25",
    time: "9:00 - 11:00",
    location: "Landmark, Lagos",
    status: "stripe",
    statusLabel: "Stripe",
    views: 234,
    bookings: 124,
    earnings: "$1200.00",
    imageUrl: "/logo-dark.png",
  },
];

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("column");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredEvents = mockEvents.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" || filter === e.status)
  );

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <h1 className="font-display text-2xl font-bold text-black">Events</h1>

      {/* Controls bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-body focus:outline-none focus:ring-2 focus:ring-ring"
              >
                All Events
                <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
              <DropdownMenuItem
                onSelect={() => setFilter("all")}
                className="cursor-pointer"
              >
                All Events
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setFilter("published")}
                className="cursor-pointer"
              >
                Published
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setFilter("draft")}
                className="cursor-pointer"
              >
                Draft
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setFilter("stripe")}
                className="cursor-pointer"
              >
                Stripe
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative flex-1 sm:max-w-[240px]">
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
            <button
              type="button"
              onClick={() => setViewMode("column")}
              className={cn(
                "flex items-center justify-center rounded-md p-2 transition-colors",
                viewMode === "column"
                  ? "bg-page text-black"
                  : "text-muted-foreground hover:text-body"
              )}
              aria-label="Column view"
              aria-pressed={viewMode === "column"}
            >
              <List className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center justify-center rounded-md p-2 transition-colors",
                viewMode === "grid"
                  ? "bg-page text-black"
                  : "text-muted-foreground hover:text-body"
              )}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <LayoutGrid className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <Link
          href="/events/create"
          className={cn(buttonVariants({ variant: "primary", size: "default" }))}
        >
          Create Event
        </Link>
      </div>

      {/* Content */}
      {viewMode === "column" ? (
        /* Column / Table view */
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-sm font-medium text-body">
                  Event Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-body">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-body">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-body">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-body">
                  Bookings
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-body">
                  Earnings
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-body">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/20"
                >
                  <td className="px-6 py-4 font-medium text-black">
                    {event.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-body">{event.date}</td>
                  <td className="px-6 py-4 text-sm text-body">
                    {event.location}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
                        event.status === "published" &&
                          "bg-primary/10 text-primary",
                        event.status === "draft" && "bg-muted text-muted-foreground",
                        event.status === "stripe" && "bg-primary/10 text-primary"
                      )}
                    >
                      {event.statusLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-body">
                    {event.bookings}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-body">
                    {event.earnings}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-body focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-label="More options"
                    >
                      <MoreVertical className="size-4" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid / Card view */
        <div className="flex gap-8">
          {/* Date column - shows date for first event, aligns with cards */}
          <div className="hidden w-[90px] shrink-0 flex-col pt-1 lg:flex">
            {filteredEvents.length > 0 && (
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold leading-tight text-black">
                  {filteredEvents[0].monthLabel}
                  <br />
                  {filteredEvents[0].dayNum}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">
                  {filteredEvents[0].dayNum}
                  {["1", "21", "31"].includes(filteredEvents[0].dayNum)
                    ? "st"
                    : ["2", "22"].includes(filteredEvents[0].dayNum)
                      ? "nd"
                      : ["3", "23"].includes(filteredEvents[0].dayNum)
                        ? "rd"
                        : "th"}{" "}
                  January
                </span>
                <span className="text-sm text-muted-foreground">
                  {filteredEvents[0].dayOfWeek}
                </span>
              </div>
            )}
          </div>

          {/* Event cards */}
          <div className="min-w-0 flex-1 space-y-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm sm:flex-row"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded px-2 py-1 text-xs font-semibold uppercase",
                        event.status === "published" &&
                          "bg-primary/10 text-primary"
                      )}
                    >
                      {event.statusLabel}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-black">
                    {event.name}
                  </h3>
                  <div className="flex flex-col gap-2 text-sm text-body">
                    <span className="flex items-center gap-2">
                      <Calendar className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      {event.views} views
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      {event.bookings} Bookings
                    </span>
                    <span className="flex items-center gap-2">
                      <DollarSign className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      {event.earnings}
                    </span>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link
                      href={`/events/${event.id}`}
                      className={cn(
                        buttonVariants({ variant: "primary", size: "default" })
                      )}
                    >
                      Manage Event
                    </Link>
                    <button
                      type="button"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "default" })
                      )}
                    >
                      More
                    </button>
                  </div>
                </div>
                <div className="relative h-48 w-full shrink-0 bg-muted sm:h-40 sm:w-48">
                  <Image
                    src={event.imageUrl}
                    alt={event.name}
                    fill
                    className="object-cover"
                    sizes="192px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 py-16">
          <p className="text-muted-foreground">
            No events found. Try adjusting your search or filters.
          </p>
          <Link
            href="/events/create"
            className={cn(buttonVariants({ variant: "primary", size: "default" }))}
          >
            Create Event
          </Link>
        </div>
      )}
    </div>
  );
}
