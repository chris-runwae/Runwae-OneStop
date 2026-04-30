"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type EventRow = {
  id: string;
  name: string;
  date: string;
  location: string;
  show: string;
  bookings: number;
  earnings: string;
  status: "Published" | "Draft" | "Ended";
};

const MOCK_EVENTS: EventRow[] = [
  { id: "1", name: "TechBurst", date: "Dec 24, 2024", location: "Lagos, NG", show: "Main Stage", bookings: 284, earnings: "$48,200", status: "Published" },
  { id: "2", name: "TechBurst Vol. 2", date: "Feb 10, 2025", location: "Abuja, NG", show: "Arena", bookings: 192, earnings: "$32,100", status: "Ended" },
  { id: "3", name: "AfroFest", date: "Mar 15, 2025", location: "London, UK", show: "Outdoor", bookings: 510, earnings: "$91,400", status: "Published" },
  { id: "4", name: "Night Market", date: "Apr 5, 2025", location: "Lagos, NG", show: "Food Zone", bookings: 88, earnings: "$12,600", status: "Draft" },
];

const FILTERS = ["All Events", "1 Week", "1 Month"] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_STYLES: Record<EventRow["status"], string> = {
  Published: "bg-primary/10 text-primary",
  Draft: "bg-muted text-muted-foreground",
  Ended: "bg-gray-100 text-gray-500",
};

export function EventsTab() {
  const [filter, setFilter] = useState<Filter>("All Events");

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between px-6 pt-5">
        <h3 className="font-semibold text-black">Events</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>All Events</span>
            <span className="text-muted-foreground/50">·</span>
            <span>{MOCK_EVENTS.length} Total</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-body hover:bg-muted/40 transition-colors"
          >
            {filter} <ChevronDown className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 px-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
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
        <table className="w-full min-w-160">
          <thead>
            <tr className="border-y border-border bg-muted/30">
              {["Event Name", "Date", "Location", "Show", "Bookings", "Earnings", "Status", "Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_EVENTS.map((ev) => (
              <tr key={ev.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-black">{ev.name}</td>
                <td className="px-6 py-4 text-sm text-body">{ev.date}</td>
                <td className="px-6 py-4 text-sm text-body">{ev.location}</td>
                <td className="px-6 py-4 text-sm text-body">{ev.show}</td>
                <td className="px-6 py-4 text-sm text-body">{ev.bookings}</td>
                <td className="px-6 py-4 text-sm font-medium text-body">{ev.earnings}</td>
                <td className="px-6 py-4">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[ev.status])}>
                    {ev.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button type="button" className="text-xs font-medium text-primary hover:underline">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
