"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ActivityIcon,
  Building2Icon,
  CalendarIcon,
  ChevronDownIcon,
  PlaneIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/app/routes";

type BookingType = "Hotel" | "Flight" | "Activity";
type BookingStatus = "Confirmed" | "Cancelled";

const bookingRows = [
  {
    confirmation: "RNWY-ABC12",
    eventName: "Techfest",
    attendeeName: "Chris Jones",
    date: "2026-03-12",
    type: "Hotel" as BookingType,
    amount: "$12,000.00",
    commission: "$1200",
    status: "Confirmed" as BookingStatus,
  },
  {
    confirmation: "RNWY-ABC12",
    eventName: "Techfest",
    attendeeName: "Chris Jones",
    date: "2026-03-12",
    type: "Flight" as BookingType,
    amount: "$12,000.00",
    commission: "$1200",
    status: "Confirmed" as BookingStatus,
  },
  {
    confirmation: "RNWY-ABC12",
    eventName: "Techfest",
    attendeeName: "Chris Jones",
    date: "2026-03-12",
    type: "Activity" as BookingType,
    amount: "$12,000.00",
    commission: "$1200",
    status: "Cancelled" as BookingStatus,
  },
  {
    confirmation: "RNWY-ABC12",
    eventName: "Techfest",
    attendeeName: "Chris Jones",
    date: "2026-03-12",
    type: "Flight" as BookingType,
    amount: "$12,000.00",
    commission: "$1200",
    status: "Cancelled" as BookingStatus,
  },
  {
    confirmation: "RNWY-ABC12",
    eventName: "Techfest",
    attendeeName: "Chris Jones",
    date: "2026-03-12",
    type: "Hotel" as BookingType,
    amount: "$12,000.00",
    commission: "$1200",
    status: "Confirmed" as BookingStatus,
  },
  {
    confirmation: "RNWY-ABC12",
    eventName: "Techfest",
    attendeeName: "Chris Jones",
    date: "2026-03-12",
    type: "Flight" as BookingType,
    amount: "$12,000.00",
    commission: "$1200",
    status: "Cancelled" as BookingStatus,
  },
  {
    confirmation: "RNWY-ABC12",
    eventName: "Techfest",
    attendeeName: "Chris Jones",
    date: "2026-03-12",
    type: "Flight" as BookingType,
    amount: "$12,000.00",
    commission: "$1200",
    status: "Confirmed" as BookingStatus,
  },
  {
    confirmation: "RNWY-ABC12",
    eventName: "Techfest",
    attendeeName: "Chris Jones",
    date: "2026-03-12",
    type: "Flight" as BookingType,
    amount: "$12,000.00",
    commission: "$1200",
    status: "Confirmed" as BookingStatus,
  },
];

function BookingTypeCell({ type }: { type: BookingType }) {
  const config = {
    Hotel: { icon: Building2Icon, label: "Hotel" },
    Flight: { icon: PlaneIcon, label: "Flight" },
    Activity: { icon: ActivityIcon, label: "Activity" },
  };
  const { icon: Icon, label } = config[type];
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="font-medium text-body">{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const isConfirmed = status === "Confirmed";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        isConfirmed ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
      }`}
    >
      {status}
    </span>
  );
}

export default function Bookings() {
  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-6 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
              Bookings
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-disabled/80 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    All Events
                    <ChevronDownIcon className="size-4" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[160px]">
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    All Events
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Upcoming
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Past Events
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-disabled/80 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    Status
                    <ChevronDownIcon className="size-4" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Confirmed
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-disabled/80 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    Type
                    <ChevronDownIcon className="size-4" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    All Types
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Hotel
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Flight
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Activity
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-disabled/80 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <CalendarIcon className="size-4" aria-hidden />
                    Date Range
                    <ChevronDownIcon className="size-4" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[160px]">
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Last 7 days
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Last 30 days
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                    Last 90 days
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <SearchIcon
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder="Search"
                  className="pl-9"
                  aria-label="Search bookings"
                />
              </div>
              <Link
                href={`${ROUTES.host.events}/create`}
                className={buttonVariants({
                  variant: "primary",
                  size: "default",
                  className: "shrink-0",
                })}
              >
                Create Event
              </Link>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-badge/50">
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Confirmation
                </th>
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Event Name
                </th>
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Attendee Name
                </th>
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Date
                </th>
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Booking Type
                </th>
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Amount
                </th>
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Commission
                </th>
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {bookingRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border transition-colors hover:bg-badge/30"
                >
                  <td className="px-6 py-4 font-medium text-body lg:px-10">
                    {row.confirmation}
                  </td>
                  <td className="px-6 py-4 font-medium text-body lg:px-10">
                    {row.eventName}
                  </td>
                  <td className="px-6 py-4 font-medium text-body lg:px-10">
                    {row.attendeeName}
                  </td>
                  <td className="px-6 py-4 font-medium text-body lg:px-10">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 lg:px-10">
                    <BookingTypeCell type={row.type} />
                  </td>
                  <td className="px-6 py-4 font-medium text-body lg:px-10">
                    {row.amount}
                  </td>
                  <td className="px-6 py-4 font-medium text-body lg:px-10">
                    {row.commission}
                  </td>
                  <td className="px-6 py-4 lg:px-10">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
