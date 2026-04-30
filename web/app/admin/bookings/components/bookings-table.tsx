"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Booking } from "./booking-detail-panel";
import { adminGetAllHotelBookings } from "@/lib/supabase/admin/hotel-bookings";
import type { HotelBooking } from "@/lib/supabase/hotel-bookings";

const FILTERS = ["Status", "Date Range", "Amount range"] as const;

function toBooking(h: HotelBooking): Booking {
  const status = (h.status ?? "Pending") as Booking["status"];
  const bookingType = (
    ["Hotel", "Flight", "Activity"].includes(h.booking_type ?? "")
      ? h.booking_type
      : "Hotel"
  ) as Booking["bookingType"];

  const amount =
    h.total_amount != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: h.currency ?? "USD",
        }).format(h.total_amount)
      : "—";

  return {
    id: h.id,
    bookingRef: h.booking_ref ?? h.confirmation_code ?? h.id,
    eventName: h.hotel_name ?? "—",
    hostName: "—",
    vendorName: "—",
    attendeeName: "—",
    bookingType,
    bookingDate: h.created_at ? h.created_at.slice(0, 10) : "—",
    status,
    dateTime: [h.checkin, h.checkout].filter(Boolean).join(" → ") || "—",
    totalRevenue: amount,
    platformCommission: "—",
    hostBreakdown: "—",
    vendorPayout: "—",
  };
}

type Props = {
  onSelectBooking: (b: Booking) => void;
};

export function BookingsTable({ onSelectBooking }: Props) {
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminGetAllHotelBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      (b.hotel_name ?? "").toLowerCase().includes(q) ||
      (b.booking_ref ?? "").toLowerCase().includes(q) ||
      (b.confirmation_code ?? "").toLowerCase().includes(q)
    );
  });

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

      {isLoading && (
        <p className="px-5 pb-5 text-sm text-muted-foreground">Loading…</p>
      )}

      {error && (
        <p className="px-5 pb-5 text-sm text-destructive">
          Failed to load bookings: {error}
        </p>
      )}

      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-y border-border bg-muted/30">
                {[
                  "Booking Ref",
                  "Hotel Name",
                  "Check-in",
                  "Check-out",
                  "Guests",
                  "Booking Type",
                  "Amount",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-medium text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
                  >
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => onSelectBooking(toBooking(b))}
                  >
                    <td className="px-5 py-3 text-xs font-mono text-muted-foreground">
                      {b.booking_ref ?? b.confirmation_code ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-black">
                      {b.hotel_name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-body">{b.checkin ?? "—"}</td>
                    <td className="px-5 py-3 text-sm text-body">{b.checkout ?? "—"}</td>
                    <td className="px-5 py-3 text-sm text-body">{b.guests ?? "—"}</td>
                    <td className="px-5 py-3">
                      <BookingTypeChip type={(b.booking_type ?? "Hotel") as Booking["bookingType"]} />
                    </td>
                    <td className="px-5 py-3 text-sm text-body">
                      {b.total_amount != null
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: b.currency ?? "USD",
                          }).format(b.total_amount)
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusChip status={b.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
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

function StatusChip({ status }: { status: string | null }) {
  const normalized = status?.toLowerCase();
  const styles =
    normalized === "confirmed"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "cancelled"
        ? "bg-rose-50 text-rose-600"
        : normalized === "pending"
          ? "bg-amber-50 text-amber-700"
          : "bg-gray-100 text-gray-500";
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", styles)}>
      {status ?? "—"}
    </span>
  );
}
