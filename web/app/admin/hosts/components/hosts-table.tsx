"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminGetAllHosts, type AdminUser } from "@/lib/supabase/admin/users";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

export function HostsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isPending, isError } = useQuery({
    queryKey: ["admin-hosts"],
    queryFn: adminGetAllHosts,
  });

  const hosts: AdminUser[] = data ?? [];

  const filtered = hosts.filter(
    (h) =>
      (h.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      h.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 pt-5">
        <p className="text-sm text-muted-foreground">Manage Event Hosts and their activities.</p>
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

      {/* States */}
      {isPending && (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Loading hosts…
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-center py-16 text-sm text-rose-500">
          Failed to load hosts. Please try again.
        </div>
      )}

      {/* Table */}
      {!isPending && !isError && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-y border-border bg-muted/30">
                {["Host ID", "Name", "Email", "Joined", "Role"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No hosts found.
                  </td>
                </tr>
              )}
              {paged.map((host) => (
                <tr key={host.id} className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/20">
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{host.id.slice(0, 8)}…</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/hosts/${host.id}`}
                      className="text-sm font-medium text-black hover:text-primary transition-colors"
                    >
                      {host.full_name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-body">{host.email}</td>
                  <td className="px-6 py-4 text-sm text-body">
                    {host.created_at
                      ? new Date(host.created_at).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-body capitalize">{host.role ?? "host"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isPending && !isError && (
        <div className="flex items-center justify-between px-6 pb-5">
          <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-body hover:bg-muted/40 disabled:opacity-40 transition-colors">
            <ChevronLeft className="size-4" /> Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} type="button" onClick={() => setPage(p)} className={cn("flex size-8 items-center justify-center rounded-lg text-sm transition-colors", p === page ? "bg-primary text-white font-medium" : "border border-border text-body hover:bg-muted/40")}>
                {p}
              </button>
            ))}
            {totalPages > 5 && <span className="px-1 text-muted-foreground">…</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Page {page} / {totalPages}</span>
            <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-body hover:bg-muted/40 disabled:opacity-40 transition-colors">
              Next <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
