"use client";

import { Download, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Attendee = {
  name: string;
  email: string;
  date: string;
  status: "Early" | "Refunded" | "Checked In" | "No Show";
};

const MOCK_ATTENDEES: Attendee[] = Array.from({ length: 10 }, (_, i) => ({
  name: "Emmanualla James",
  email: "emmaeiia@gmail.com",
  date: "23-11-2025",
  status: (["Early", "Refunded", "Checked In", "No Show", "Early"] as Attendee["status"][])[i % 5],
}));

const attendeeStats = [
  { label: "Registered Attendees", value: "1,067", color: "text-emerald-600 bg-emerald-50" },
  { label: "No-shows", value: "50", color: "text-sky-600 bg-sky-50" },
  { label: "Check-ins", value: "500", color: "text-amber-600 bg-amber-50" },
  { label: "Cancelled", value: "04", color: "text-rose-500 bg-rose-50" },
];

const STATUS_STYLES: Record<Attendee["status"], string> = {
  Early: "bg-emerald-50 text-emerald-700",
  "Checked In": "bg-sky-50 text-sky-700",
  Refunded: "bg-amber-50 text-amber-700",
  "No Show": "bg-rose-50 text-rose-600",
};

export function AttendeesTab() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_ATTENDEES.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {attendeeStats.map((s) => (
          <div key={s.label} className={cn("flex flex-col gap-1 rounded-xl p-5", s.color)}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Attendee List */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between px-5 pt-5">
          <h3 className="font-semibold text-black">Attendee List</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search Attendee"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-44 rounded-lg border border-border bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-body hover:bg-muted/40 transition-colors"
            >
              <Download className="size-3.5" /> Download CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-y border-border bg-muted/30">
                {["Name", "Email", "Date", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => (
                <tr key={idx} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {a.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-black">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-body">{a.email}</td>
                  <td className="px-5 py-3 text-sm text-body">{a.date}</td>
                  <td className="px-5 py-3">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[a.status])}>
                      {a.status}
                    </span>
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
