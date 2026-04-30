"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vendor } from "./vendor-detail-panel";

const MOCK_VENDORS: Vendor[] = Array.from({ length: 40 }, (_, i) => ({
  id: `#VEN${String(i + 100).padStart(3, "0")}${45 + i}`,
  businessName: ["Bua Hotel", "Sun Hotel", "Park Suites", "Lagos Grand", "Island Inn"][i % 5],
  type: ["Hotel", "Hotel", "Restaurant", "Hotel", "Activities"][i % 5],
  location: ["Landmark", "Victoria Island", "Lekki", "Ikeja", "Abuja"][i % 5],
  partnership: i % 5 === 0 ? 0 : 4,
  totalBookings: 1127,
  totalRevenue: "$750,000",
  status: (["Active", "Active", "Pending", "Inactive", "Active"] as Vendor["status"][])[i % 5],
  contactInfo: `+234 813${4000 + i}`,
  website: "www.theglobalhotellagos.com",
  dateRange: "2024-03-11 · 12:03PM – 12:04PM",
}));

const STATUS_STYLES: Record<Vendor["status"], string> = {
  Active: "text-emerald-600",
  Pending: "text-amber-600",
  Inactive: "text-muted-foreground",
};

const PAGE_SIZE = 9;

type Props = {
  onSelectVendor: (v: Vendor) => void;
};

export function VendorsTable({ onSelectVendor }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = MOCK_VENDORS.filter(
    (v) =>
      v.businessName.toLowerCase().includes(search.toLowerCase()) ||
      v.id.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-5 pt-5">
        {["Status", "Type", "Vendor"].map((f) => (
          <button
            key={f}
            type="button"
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-body hover:bg-muted/40 transition-colors"
          >
            {f} <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        ))}
        <div className="relative flex-1 min-w-36 max-w-52">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <button
          type="button"
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          <Upload className="size-4" /> Export
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-175">
          <thead>
            <tr className="border-y border-border bg-muted/30">
              {["Vendor ID", "Business Name", "Type", "Location", "Partnership", "Total bookings", "Total Revenue"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((v) => (
              <tr
                key={v.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => onSelectVendor(v)}
              >
                <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{v.id}</td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        v.status === "Active" ? "bg-emerald-500" : v.status === "Pending" ? "bg-amber-400" : "bg-gray-300",
                      )}
                    />
                    <span className="text-sm font-medium text-black">{v.businessName}</span>
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-body">{v.type}</td>
                <td className="px-5 py-3 text-sm text-body">{v.location}</td>
                <td className="px-5 py-3 text-sm text-body">{v.partnership}</td>
                <td className="px-5 py-3 text-sm text-body">{v.totalBookings.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm font-medium text-body">{v.totalRevenue}</td>
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
                p === page ? "bg-primary text-white font-medium" : "border border-border text-body hover:bg-muted/40",
              )}
            >
              {p}
            </button>
          ))}
          {totalPages > 5 && <span className="px-1 text-sm text-muted-foreground">…</span>}
          {totalPages > 5 && (
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              className="flex size-8 items-center justify-center rounded-lg border border-border text-sm text-body hover:bg-muted/40"
            >
              {totalPages}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
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
