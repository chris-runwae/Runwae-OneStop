"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/supabase/events";

const FILTERS = ["All Events", "Published", "Draft", "Ended"] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_STYLES: Record<string, string> = {
  published: "bg-primary/10 text-primary",
  PUBLISHED: "bg-primary/10 text-primary",
  draft: "bg-muted text-muted-foreground",
  ended: "bg-gray-100 text-gray-500",
};

type Props = { events: Event[] };

export function EventsTab({ events }: Props) {
  const [filter, setFilter] = useState<Filter>("All Events");

  const filtered = filter === "All Events"
    ? events
    : events.filter((e) => {
        const s = (e.status ?? "draft").toLowerCase();
        return s === filter.toLowerCase();
      });

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between px-6 pt-5">
        <h3 className="font-semibold text-black">Events</h3>
        <span className="text-xs text-muted-foreground">{filtered.length} Total</span>
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
              {["Event Name", "Date", "Location", "Participants", "Views", "Status", "Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  No events found.
                </td>
              </tr>
            ) : filtered.map((ev) => {
              const status = (ev.status ?? "draft").toLowerCase();
              const dateStr = ev.start_date
                ? new Date(ev.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—";
              return (
                <tr key={ev.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-black">{ev.name}</td>
                  <td className="px-6 py-4 text-sm text-body whitespace-nowrap">{dateStr}</td>
                  <td className="px-6 py-4 text-sm text-body">{ev.location ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-body text-center">{ev.current_participants ?? 0}</td>
                  <td className="px-6 py-4 text-sm text-body text-center">{ev.view_count ?? 0}</td>
                  <td className="px-6 py-4">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", STATUS_STYLES[status] ?? STATUS_STYLES.draft)}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a href={`/admin/events/${ev.id}`} className="text-xs font-medium text-primary hover:underline">
                      View
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
