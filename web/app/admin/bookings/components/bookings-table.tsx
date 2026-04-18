"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Booking } from "./booking-detail-panel";

const BOOKING_TYPES: Booking["bookingType"][] = ["Hotel", "Flight", "Activity", "Hotel", "Flight", "Hotel", "Activity", "Flight", "Hotel", "Hotel", "Hotel", "Hotel"];

export const MOCK_BOOKINGS: Booking[] = Array.from({ length: 24 }, (_, i) => ({
  id: `#N${String(i + 40).padStart(4, "0")}45`,
  bookingRef: `Run${2300 + i}`,
  eventName: "Techfest",
  hostName: "Tech cabal",
  vendorName: "United Nigeria",
  attendeeName: "Chris Jones",
  bookingType: BOOKING_TYPES[i % BOOKING_TYPES.length],
  bookingDate: "12-05-2025",
  status: (["Confirmed", "Confirmed", "Pending", "Cancelled", "Confirmed"] as Booking["status"][])[i % 5],
  dateTime: "2026-03-12 · 12:00PM",
  totalRevenue: "$40,000.00",
  platformCommission: "$4,000",
  hostBreakdown: "$200",
  vendorPayout: "$500.00",
}));

const FILTERS = ["Event", "Status", "Date Range", "Amount range"] as const;

type Props = {
  onSelectBooking: (b: Booking) => void;
};

export function BookingsTable({ onSelectBooking }: Props) {
  const [search, setSearch] = useState("");

  const filtered = MOCK_BOOKINGS.filter(
    (b) =>
      b.eventName.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.attendeeName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-5 pt-5">
        <div className="relative flex-1 min-w-36 max-w-52">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-body hover:bg-muted/40 transition-colors"
          >
            {f} <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-y border-border bg-muted/30">
              {["Booking ID", "Event Name", "Host Name", "Vendor name", "Attendee Name", "Booking Type", "Booking Date"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr
                key={b.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => onSelectBooking(b)}
              >
                <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{b.id}</td>
                <td className="px-5 py-3 text-sm font-medium text-black">{b.eventName}</td>
                <td className="px-5 py-3 text-sm text-body">{b.hostName}</td>
                <td className="px-5 py-3 text-sm text-body">{b.vendorName}</td>
                <td className="px-5 py-3 text-sm text-body">{b.attendeeName}</td>
                <td className="px-5 py-3">
                  <BookingTypeChip type={b.bookingType} />
                </td>
                <td className="px-5 py-3 text-sm text-body">{b.bookingDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingTypeChip({ type }: { type: Booking["bookingType"] }) {
  const colors: Record<Booking["bookingType"], string> = {
    Hotel: "bg-sky-50 text-sky-700",
    Flight: "bg-violet-50 text-violet-700",
    Activity: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", colors[type])}>
      {type}
    </span>
  );
}
