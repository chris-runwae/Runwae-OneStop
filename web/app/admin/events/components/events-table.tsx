"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminEvent = {
  id: string;
  name: string;
  organisation: string;
  dates: string;
  location: string;
  status: "Pending" | "Published" | "Ended" | "Draft";
  partner: number;
};

const MOCK_EVENTS: AdminEvent[] = Array.from({ length: 24 }, (_, i) => ({
  id: `#N${String(i + 40).padStart(4, "0")}${45 + i}`,
  name: ["Techfest", "AfroFest", "Night Market", "TechBurst", "SoundWave"][i % 5],
  organisation: "Tech cabal",
  dates: `${12 + (i % 5)}-0${3 + (i % 4)}-2025`,
  location: "Landmark",
  status: (["Pending", "Pending", "Published", "Draft", "Ended"] as AdminEvent["status"][])[i % 5],
  partner: 20 + i,
}));

const STATUS_STYLES: Record<AdminEvent["status"], string> = {
  Pending: "text-amber-600",
  Published: "text-emerald-600",
  Ended: "text-gray-400",
  Draft: "text-muted-foreground",
};

const PAGE_SIZE = 9;
const FILTERS = ["Location", "Status", "Type", "Date Range"];

export function EventsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = MOCK_EVENTS.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleAll = () => {
    if (selected.size === paged.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paged.map((e) => e.id)));
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-5 pt-5">
        <div className="relative flex-1 min-w-40 max-w-56">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="border-y border-border bg-muted/30">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.size === paged.length && paged.length > 0}
                  onChange={toggleAll}
                  className="size-4 rounded border-input accent-primary cursor-pointer"
                />
              </th>
              {["Event ID", "Event Name", "Organization", "Date(s)", "Location", "Status", "Partner"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((ev) => (
              <tr
                key={ev.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                <td className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(ev.id)}
                    onChange={() => toggle(ev.id)}
                    className="size-4 rounded border-input accent-primary cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{ev.id}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/events/${ev.id}`}
                    className="text-sm font-medium text-black hover:text-primary transition-colors"
                  >
                    {ev.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-body">{ev.organisation}</td>
                <td className="px-4 py-3 text-sm text-body">{ev.dates}</td>
                <td className="px-4 py-3 text-sm text-body">{ev.location}</td>
                <td className="px-4 py-3">
                  <span className={cn("text-sm font-medium", STATUS_STYLES[ev.status])}>
                    {ev.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-body">{ev.partner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 pb-5">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-body hover:bg-muted/40 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="size-4" /> Previous
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg text-sm transition-colors",
                p === page
                  ? "bg-primary text-white font-medium"
                  : "border border-border text-body hover:bg-muted/40",
              )}
            >
              {p}
            </button>
          ))}
          {totalPages > 5 && <span className="px-1 text-muted-foreground text-sm">…</span>}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Page {page} / {totalPages}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-body hover:bg-muted/40 disabled:opacity-40 transition-colors ml-1"
          >
            Next <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
