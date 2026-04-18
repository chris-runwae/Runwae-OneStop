"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Host = {
  id: string;
  name: string;
  organisation: string;
  registration: string;
  eventsCreated: number;
  earningsPerMonth: string;
  status: "Active" | "Pending" | "Suspended";
};

const MOCK_HOSTS: Host[] = Array.from({ length: 28 }, (_, i) => ({
  id: `HST-${String(i + 1).padStart(4, "0")}`,
  name: ["Christopher Jones", "Amara Osei", "Lena Mueller", "David Park", "Sofia Rossi", "James Okonkwo"][i % 6],
  organisation: ["AfroNation Ltd", "Osei Events", "Mueller Concepts", "Park Global", "Rossi Inc", "Okonkwo Corp"][i % 6],
  registration: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i % 6]} ${10 + (i % 15)}, 2024`,
  eventsCreated: 2 + (i % 10),
  earningsPerMonth: `$${(1200 + i * 320).toLocaleString()}`,
  status: (["Active", "Active", "Pending", "Active", "Suspended", "Active"] as Host["status"][])[i % 6],
}));

const PAGE_SIZE = 8;

const STATUS_STYLES: Record<Host["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Suspended: "bg-rose-50 text-rose-600",
};

export function HostsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = MOCK_HOSTS.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.id.toLowerCase().includes(search.toLowerCase()) ||
      h.organisation.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 pt-5">
        <p className="text-sm text-muted-foreground">
          Manage Event Hosts and their activities.
        </p>
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search hosts…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-y border-border bg-muted/30">
              {["Host ID", "Name", "Organisation", "Registration", "Events Created", "Earnings/Mo", "Status"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((host) => (
              <tr
                key={host.id}
                className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/20"
              >
                <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{host.id}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/hosts/${host.id}`}
                    className="text-sm font-medium text-black hover:text-primary transition-colors"
                  >
                    {host.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-body">{host.organisation}</td>
                <td className="px-6 py-4 text-sm text-body">{host.registration}</td>
                <td className="px-6 py-4 text-sm text-body">{host.eventsCreated}</td>
                <td className="px-6 py-4 text-sm font-medium text-body">{host.earningsPerMonth}</td>
                <td className="px-6 py-4">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[host.status])}>
                    {host.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 pb-5">
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
          {totalPages > 5 && <span className="px-1 text-muted-foreground">…</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-body hover:bg-muted/40 disabled:opacity-40 transition-colors"
          >
            Next <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
