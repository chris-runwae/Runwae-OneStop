"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminGetAllEvents } from "@/lib/supabase/admin/events";
import type { Event } from "@/lib/supabase/events";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const STATUS_PILL: Record<string, string> = {
  published: "border border-emerald-300 text-emerald-700 bg-emerald-50",
  PUBLISHED:  "border border-emerald-300 text-emerald-700 bg-emerald-50",
  pending:    "border border-amber-300 text-amber-700 bg-amber-50",
  draft:      "border border-gray-200 text-gray-500 bg-gray-50",
  ended:      "border border-gray-200 text-gray-400 bg-gray-50",
};

const PAGE_SIZE = 9;
const FILTERS = ["Location", "Status", "Type", "Date Range"];
const HEADERS = [
  "Event ID", "Event Name", "Organization", "Date(s)", "Location",
  "Status", "Partnership count", "Booking count", "GMV", "Views", "Join Date", "Action",
];

export function EventsTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isPending, isError } = useQuery({
    queryKey: ["admin-events"],
    queryFn: adminGetAllEvents,
  });

  const events: Event[] = data ?? [];

  const filtered = events.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.location ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map((e) => e.id)));
  };
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
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
          <button key={f} type="button" className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-body hover:bg-muted/40 transition-colors">
            {f} <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        ))}
      </div>

      {isPending && <div className="py-16 text-center text-sm text-muted-foreground">Loading events…</div>}
      {isError  && <div className="py-16 text-center text-sm text-rose-500">Failed to load events.</div>}

      {!isPending && !isError && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-275">
            <thead>
              <tr className="border-y border-border bg-muted/30">
                <th className="w-10 px-5 py-5">
                  <input
                    type="checkbox"
                    checked={selected.size === paged.length && paged.length > 0}
                    onChange={toggleAll}
                    className="size-4 rounded border-input accent-primary cursor-pointer"
                  />
                </th>
                {HEADERS.map((h) => (
                  <th key={h} className="px-5 py-5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="py-12 text-center text-sm text-muted-foreground">
                    No events found.
                  </td>
                </tr>
              )}
              {paged.map((ev, i) => {
                const status = (ev.status ?? "draft").toLowerCase();
                const dateStr = ev.start_date
                  ? new Date(ev.start_date).toLocaleDateString("en-GB").replace(/\//g, "-")
                  : "—";
                const joinDate = ev.start_date
                  ? new Date(ev.start_date).toLocaleDateString("en-GB").replace(/\//g, "-")
                  : "—";

                return (
                  <tr
                    key={ev.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/events/${ev.id}`)}
                  >
                    <td className="w-10 px-5 py-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(ev.id)}
                        onChange={() => toggle(ev.id)}
                        className="size-4 rounded border-input accent-primary cursor-pointer"
                      />
                    </td>
                    {/* Event ID */}
                    <td className="px-5 py-5 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {ev.id}
                    </td>
                    {/* Event Name */}
                    <td className="px-5 py-5">
                      <Link
                        href={`/admin/events/${ev.id}`}
                        className="text-sm font-medium text-black hover:text-primary transition-colors whitespace-nowrap"
                      >
                        {ev.name}
                      </Link>
                    </td>
                    {/* Organization — derived from category or slug until joined */}
                    <td className="px-5 py-5 text-sm text-body whitespace-nowrap">
                      {ev.category ?? "—"}
                    </td>
                    {/* Date(s) */}
                    <td className="px-5 py-5 text-sm text-body whitespace-nowrap">{dateStr}</td>
                    {/* Location */}
                    <td className="px-5 py-5 text-sm text-body whitespace-nowrap">{ev.location ?? "—"}</td>
                    {/* Status */}
                    <td className="px-5 py-5">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize whitespace-nowrap", STATUS_PILL[status] ?? STATUS_PILL.draft)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    {/* Partnership count — placeholder */}
                    <td className="px-5 py-5 text-sm text-body text-center">{20 + (i % 10)}</td>
                    {/* Booking count — placeholder */}
                    <td className="px-5 py-5 text-sm text-body text-center">{100 + (i * 40) % 900}</td>
                    {/* GMV — placeholder */}
                    <td className="px-5 py-5 text-sm text-body whitespace-nowrap">
                      ${(1_000_000 + i * 50_000).toLocaleString()}.00
                    </td>
                    {/* Views — placeholder */}
                    <td className="px-5 py-5 text-sm text-body text-center">{1000 + (i * 350) % 8000}</td>
                    {/* Join Date */}
                    <td className="px-5 py-5 text-sm text-body whitespace-nowrap">{joinDate}</td>
                    {/* Action */}
                    <td className="px-5 py-5" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-black transition-colors"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-40">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/events/${ev.id}`} className="cursor-pointer text-sm">
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-sm">Feature on Homepage</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-sm">Add Admin Note</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-sm text-rose-500 focus:text-rose-500">
                            Unpublish Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isPending && !isError && (
        <div className="flex items-center justify-between px-5 pb-5">
          <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-body hover:bg-muted/40 disabled:opacity-40 transition-colors">
            <ChevronLeft className="size-4" /> Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} type="button" onClick={() => setPage(p)} className={cn("flex size-8 items-center justify-center rounded-lg text-sm transition-colors", p === page ? "bg-primary text-white font-medium" : "border border-border text-body hover:bg-muted/40")}>
                {p}
              </button>
            ))}
            {totalPages > 5 && <span className="px-1 text-sm text-muted-foreground">…</span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Page {page} / {totalPages}
            <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="ml-1 flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-body hover:bg-muted/40 disabled:opacity-40 transition-colors">
              Next <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
