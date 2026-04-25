"use client";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ChevronsUpDown, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type LocationValue = {
  destinationLabel: string;
  destinationId?: Id<"destinations">;
  coords?: { lat: number; lng: number };
};

export function LocationPicker({
  value,
  onChange,
  className,
  placeholder = "Search destinations…",
}: {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(value.destinationLabel);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value into the search term when picker is closed
  useEffect(() => {
    if (!open) setTerm(value.destinationLabel);
  }, [value.destinationLabel, open]);

  const results = useQuery(
    api.search.searchAll,
    open && term.trim().length >= 2 ? { term, limit: 8 } : "skip"
  );

  // Outside click / Escape
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pickDestination(d: { _id: Id<"destinations">; name: string; country: string; coords?: { lat: number; lng: number } }) {
    onChange({
      destinationLabel: `${d.name}, ${d.country}`,
      destinationId: d._id,
      coords: d.coords,
    });
    setOpen(false);
  }

  function commitFreeText() {
    const trimmed = term.trim();
    if (trimmed.length === 0) return;
    onChange({ destinationLabel: trimmed, destinationId: undefined, coords: undefined });
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-background px-4 text-left text-sm focus:border-primary focus:outline-none"
      >
        <span className={cn("truncate", !value.destinationLabel && "text-muted-foreground")}>
          {value.destinationLabel || placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={placeholder}
              className="h-10 flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {term.trim().length < 2 ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                Type at least 2 characters to search.
              </li>
            ) : results === undefined ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">Searching…</li>
            ) : (results.destinations ?? []).length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                No matches — use as typed below.
              </li>
            ) : (
              (results.destinations ?? []).map((d) => (
                <li key={d._id}>
                  <button
                    type="button"
                    onClick={() => pickDestination(d)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
                  >
                    {d.heroImageUrl ? (
                      <img src={d.heroImageUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-md bg-muted">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{d.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{d.country}</span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>

          {term.trim().length > 0 && (
            <button
              type="button"
              onClick={commitFreeText}
              className="block w-full border-t border-border px-3 py-2 text-left text-xs font-medium text-primary hover:bg-muted"
            >
              Use &ldquo;{term.trim()}&rdquo; as typed
            </button>
          )}
        </div>
      )}
    </div>
  );
}
