"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { InputField } from "@/components/ui/input-field";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Camera,
  ChevronDown,
  Eye,
  FileText,
  Globe,
  MapPin,
  Plus,
  Ticket,
} from "lucide-react";
import { useState } from "react";

const visibilityOptions = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "draft", label: "Draft" },
];

const themePlaceholders = [1, 2, 3, 4];

export default function CreateEvent() {
  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [ticketLink, setTicketLink] = useState("");
  const [bookings, setBookings] = useState("");
  const [visibility, setVisibility] = useState("public");

  const eventSlug = eventName
    ? eventName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    : "event-name";

  return (
    <div className="flex flex-col gap-8 p-6 sm:p-8 lg:p-10">
      {/* Top bar: Public dropdown + Preview */}
      <div className="flex flex-wrap items-center justify-end gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-body focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Globe className="size-4 text-muted-foreground" aria-hidden />
              {visibilityOptions.find((o) => o.value === visibility)?.label ??
                "Public"}
              <ChevronDown
                className="size-4 text-muted-foreground"
                aria-hidden
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            {visibilityOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onSelect={() => setVisibility(opt.value)}
                className="cursor-pointer"
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "inline-flex items-center gap-2",
          )}
        >
          <Eye className="size-4" aria-hidden />
          Preview
        </button>
      </div>

      {/* Banner + Form grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1.2fr_420px]">
        {/* Event Banner */}
        <div className="relative flex min-h-[200px] items-center justify-center rounded-xl border border-border bg-muted/50 sm:min-h-[280px]">
          <button
            type="button"
            className="flex size-14 items-center justify-center gap-1 rounded-full bg-primary text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Upload event banner"
          >
            <Camera className="size-6" aria-hidden />
            <Plus className="size-5" aria-hidden strokeWidth={2.5} />
          </button>
        </div>

        {/* Form column */}
        <div className="flex flex-col gap-6">
          {/* Event Name */}
          <Input
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="h-12 rounded-lg bg-surface text-lg font-medium placeholder:text-muted-foreground"
          />

          {/* Event Details */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-base font-semibold text-black">
              Event Details
            </h3>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
              <InputField
                icon={<Calendar className="size-4" aria-hidden />}
                placeholder="Start Date"
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="min-w-0 flex-1 bg-surface"
              />
              <InputField
                icon={<Calendar className="size-4" aria-hidden />}
                placeholder="End Date"
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="min-w-0 flex-1 bg-surface"
              />
            </div>
            <InputField
              icon={<MapPin className="size-4" aria-hidden />}
              placeholder="Event Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-surface"
            />
            <InputField
              icon={<FileText className="size-4" aria-hidden />}
              placeholder="Add Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-surface"
            />
          </div>

          {/* Event Category */}
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-base font-semibold text-black">
              Event Category
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-3 text-left text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <span>{category || "Select Category"}</span>
                  <ChevronDown className="size-4" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[200px]">
                <DropdownMenuItem
                  onSelect={() => setCategory("Conference")}
                  className="cursor-pointer"
                >
                  Conference
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setCategory("Workshop")}
                  className="cursor-pointer"
                >
                  Workshop
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setCategory("Meetup")}
                  className="cursor-pointer"
                >
                  Meetup
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setCategory("Other")}
                  className="cursor-pointer"
                >
                  Other
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Ticketing (optional) */}
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-base font-semibold text-black">
              Ticketing{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </h3>
            <InputField
              icon={<Ticket className="size-4" aria-hidden />}
              placeholder="Ticket Link"
              value={ticketLink}
              onChange={(e) => setTicketLink(e.target.value)}
              className="bg-surface"
            />
          </div>

          {/* Event Link (read-only) */}
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-base font-semibold text-black">
              Event Link
            </h3>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
              runwae.io/events/{eventSlug}
            </div>
          </div>

          {/* Bookings */}
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-base font-semibold text-black">
              Bookings
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-3 text-left text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <span>{bookings || "Select Bookings"}</span>
                  <ChevronDown className="size-4" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[200px]">
                <DropdownMenuItem
                  onSelect={() => setBookings("Enable bookings")}
                  className="cursor-pointer"
                >
                  Enable bookings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setBookings("Disable bookings")}
                  className="cursor-pointer"
                >
                  Disable bookings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Select Theme */}
      <div className="flex flex-col gap-4">
        <h3 className="font-display text-base font-semibold text-black">
          Select Theme
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {themePlaceholders.map((i) => (
            <button
              key={i}
              type="button"
              className="group flex aspect-video items-center justify-center rounded-lg border-2 border-border bg-gradient-to-br from-primary/10 to-primary/5 transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <svg
                className="size-12 text-primary/30"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M2 12h4v-2H2v2zm0-4h4V6H2v2zm0 8h4v-2H2v2zm6 0h14v-2H8v2zm0-4h14v-2H8v2zm0-6v2h14V6H8z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Create Event Button */}
      <div className="flex justify-end">
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "primary", size: "lg" }),
            "min-w-[180px]",
          )}
        >
          Create Event
        </button>
      </div>
    </div>
  );
}
