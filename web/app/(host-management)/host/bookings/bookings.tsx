"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  Building2Icon,
  CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/app/routes";
import { FilterDropdown } from "../components/filter-dropdown";
import { SearchInput } from "../components/search-input";
import { useEffect, useState } from "react";
import { getHotelBookings, type HotelBooking } from "@/lib/supabase/hotel-bookings";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

const DATE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

function StatusBadge({ status }: { status: string | null }) {
  const normalized = status?.toLowerCase();
  const isConfirmed = normalized === "confirmed";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        isConfirmed
          ? "bg-success/15 text-success"
          : "bg-destructive/15 text-destructive"
      }`}
    >
      {status ?? "—"}
    </span>
  );
}

const tableHeader =
  "px-4 py-3 font-display font-semibold text-heading sm:px-6 lg:px-10 lg:py-4";
const tableCell =
  "px-4 py-3 font-medium text-body sm:px-6 lg:px-10 lg:py-4";

function formatAmount(currency: string | null, amount: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "USD",
  }).format(amount);
}

export default function Bookings() {
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    getHotelBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== "all") {
      if ((b.status ?? "").toLowerCase() !== statusFilter) return false;
    }
    if (dateFilter !== "all") {
      const days = parseInt(dateFilter, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      if (!b.created_at || new Date(b.created_at) < cutoff) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const matches =
        b.hotel_name?.toLowerCase().includes(q) ||
        b.booking_ref?.toLowerCase().includes(q) ||
        b.confirmation_code?.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8 xl:p-10">
      <div className="overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
        <div className="border-b border-border px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
              Hotel Bookings
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <FilterDropdown
                label="Status"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onSelect={setStatusFilter}
                minWidth="min-w-35"
              />
              <FilterDropdown
                label="Date Range"
                options={DATE_OPTIONS}
                value={dateFilter}
                onSelect={setDateFilter}
                icon={CalendarIcon}
                minWidth="min-w-40"
              />
              <SearchInput
                placeholder="Search"
                aria-label="Search bookings"
                className="w-full sm:w-auto"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Link
                href={ROUTES.host.eventsCreate}
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

        {error && (
          <p className="px-4 py-6 text-sm text-destructive sm:px-6 lg:px-10">
            Failed to load bookings: {error}
          </p>
        )}

        {isLoading && (
          <p className="px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-10">
            Loading…
          </p>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full min-w-225 text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-badge/50">
                  <th className={tableHeader}>Confirmation</th>
                  <th className={tableHeader}>Booking Ref</th>
                  <th className={tableHeader}>Hotel</th>
                  <th className={tableHeader}>Check-in</th>
                  <th className={tableHeader}>Check-out</th>
                  <th className={tableHeader}>Guests</th>
                  <th className={tableHeader}>Rooms</th>
                  <th className={tableHeader}>Amount</th>
                  <th className={tableHeader}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6 lg:px-10"
                    >
                      {bookings.length === 0 ? "No hotel bookings found." : "No bookings match your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-border transition-colors hover:bg-badge/30"
                    >
                      <td className={tableCell}>
                        <div className="flex items-center gap-2">
                          <Building2Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                          {row.confirmation_code ?? "—"}
                        </div>
                      </td>
                      <td className={tableCell}>{row.booking_ref ?? "—"}</td>
                      <td className={tableCell}>{row.hotel_name ?? "—"}</td>
                      <td className={tableCell}>{row.checkin ?? "—"}</td>
                      <td className={tableCell}>{row.checkout ?? "—"}</td>
                      <td className={tableCell}>{row.guests ?? "—"}</td>
                      <td className={tableCell}>{row.room_count ?? "—"}</td>
                      <td className={tableCell}>
                        {formatAmount(row.currency, row.total_amount)}
                      </td>
                      <td className={tableCell}>
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
