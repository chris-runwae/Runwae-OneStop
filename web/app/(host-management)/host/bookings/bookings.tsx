"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  ActivityIcon,
  Building2Icon,
  CalendarIcon,
  PlaneIcon,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/app/routes";
import { FilterDropdown } from "../components/filter-dropdown";
import { SearchInput } from "../components/search-input";

type BookingType = "Hotel" | "Flight" | "Activity";
type BookingStatus = "Confirmed" | "Cancelled";

const EVENT_OPTIONS = [
  { value: "all", label: "All Events" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past Events" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "hotel", label: "Hotel" },
  { value: "flight", label: "Flight" },
  { value: "activity", label: "Activity" },
];

const DATE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

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
    status: "Cancelled" as BookingStatus,
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

const tableHeader =
  "px-4 py-3 font-display font-semibold text-heading sm:px-6 lg:px-10 lg:py-4";
const tableCell =
  "px-4 py-3 font-medium text-body sm:px-6 lg:px-10 lg:py-4";

export default function Bookings() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8 xl:p-10">
      <div className="overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
        <div className="border-b border-border px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
              Bookings
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <FilterDropdown
                label="All Events"
                options={EVENT_OPTIONS}
                minWidth="min-w-[160px]"
              />
              <FilterDropdown
                label="Status"
                options={STATUS_OPTIONS}
                minWidth="min-w-[140px]"
              />
              <FilterDropdown
                label="Type"
                options={TYPE_OPTIONS}
                minWidth="min-w-[140px]"
              />
              <FilterDropdown
                label="Date Range"
                options={DATE_OPTIONS}
                icon={CalendarIcon}
                minWidth="min-w-[160px]"
              />
              <SearchInput
                placeholder="Search"
                aria-label="Search bookings"
                className="w-full sm:w-auto"
              />
              <Link
                href={`${ROUTES.host.events}/create`}
                className={buttonVariants({
                  variant: "primary",
                  size: "default",
                  className: "w-full shrink-0 sm:w-auto",
                })}
              >
                Create Event
              </Link>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-badge/50">
                <th className={tableHeader}>Confirmation</th>
                <th className={tableHeader}>Event Name</th>
                <th className={tableHeader}>Attendee Name</th>
                <th className={tableHeader}>Date</th>
                <th className={tableHeader}>Booking Type</th>
                <th className={tableHeader}>Amount</th>
                <th className={tableHeader}>Commission</th>
                <th className={tableHeader}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border transition-colors hover:bg-badge/30"
                >
                  <td className={tableCell}>{row.confirmation}</td>
                  <td className={tableCell}>{row.eventName}</td>
                  <td className={tableCell}>{row.attendeeName}</td>
                  <td className={tableCell}>{row.date}</td>
                  <td className={tableCell}>
                    <BookingTypeCell type={row.type} />
                  </td>
                  <td className={tableCell}>{row.amount}</td>
                  <td className={tableCell}>{row.commission}</td>
                  <td className={tableCell}>
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
