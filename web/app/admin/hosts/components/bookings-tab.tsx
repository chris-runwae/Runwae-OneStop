"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Booking = {
  code: string;
  eventName: string;
  type: string;
  bookingType: string;
  expiration: string;
  amount: string;
  status: "Confirmed" | "Pending" | "Cancelled" | "Refunded";
};

const MOCK_BOOKINGS: Booking[] = [
  { code: "CONF-8821", eventName: "TechBurst", type: "Solo Trip", bookingType: "Standard", expiration: "Dec 24, 2024", amount: "$180", status: "Confirmed" },
  { code: "CONF-8834", eventName: "AfroFest", type: "Van Trip", bookingType: "VIP", expiration: "Mar 15, 2025", amount: "$420", status: "Confirmed" },
  { code: "CONF-8901", eventName: "Night Market", type: "Boat Trip", bookingType: "Premium", expiration: "Apr 5, 2025", amount: "$320", status: "Pending" },
  { code: "CONF-7761", eventName: "TechBurst Vol. 2", type: "Solo Trip", bookingType: "Standard", expiration: "Feb 10, 2025", amount: "$150", status: "Cancelled" },
  { code: "CONF-7845", eventName: "AfroFest", type: "Van Trip", bookingType: "VIP", expiration: "Mar 15, 2025", amount: "$420", status: "Refunded" },
  { code: "CONF-9012", eventName: "TechBurst", type: "Solo Trip", bookingType: "Standard", expiration: "Dec 24, 2024", amount: "$180", status: "Confirmed" },
];

const FILTERS = ["All Bookings", "Solo Trip", "Van Trip", "Boat Trip"] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_STYLES: Record<Booking["status"], string> = {
  Confirmed: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Cancelled: "bg-rose-50 text-rose-600",
  Refunded: "bg-gray-100 text-gray-500",
};

export function BookingsTab() {
  const [filter, setFilter] = useState<Filter>("All Bookings");

  const filtered = filter === "All Bookings"
    ? MOCK_BOOKINGS
    : MOCK_BOOKINGS.filter((b) => b.type === filter);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between px-6 pt-5">
        <h3 className="font-semibold text-black">Bookings</h3>
        <span className="text-xs text-muted-foreground">{filtered.length} Total</span>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 px-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "bg-primary text-white"
                : "border border-border text-body hover:bg-muted/40",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-y border-border bg-muted/30">
              {["Confirmation Code", "Event Name", "Type", "Booking Type", "Expiration Date", "Amount", "Status"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.code} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{b.code}</td>
                <td className="px-6 py-4 text-sm font-medium text-black">{b.eventName}</td>
                <td className="px-6 py-4 text-sm text-body">{b.type}</td>
                <td className="px-6 py-4 text-sm text-body">{b.bookingType}</td>
                <td className="px-6 py-4 text-sm text-body">{b.expiration}</td>
                <td className="px-6 py-4 text-sm font-medium text-body">{b.amount}</td>
                <td className="px-6 py-4">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[b.status])}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
