"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type TzOption = {
  id: string;        // IANA id, e.g. "Europe/London"
  city: string;      // last segment, humanised, e.g. "London"
  region: string;    // first segment, e.g. "Europe"
  offset: string;    // current offset, e.g. "GMT+1"
};

function listTimezones(): string[] {
  try {
    if (typeof Intl.supportedValuesOf === "function") {
      return Intl.supportedValuesOf("timeZone");
    }
  } catch {
    // fall through
  }
  return [];
}

function offsetFor(tz: string, at: Date): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(at);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

function buildOptions(): TzOption[] {
  const now = new Date();
  return listTimezones()
    .map((id) => {
      const segments = id.split("/");
      const region = segments[0] ?? "";
      const city = (segments[segments.length - 1] ?? id).replace(/_/g, " ");
      return { id, city, region, offset: offsetFor(id, now) };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function TimezonePicker({
  value,
  onChange,
  placeholder = "Search by city or region…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const options = useMemo(buildOptions, []);
  const selected = useMemo(
    () => options.find((o) => o.id === value),
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 200);
    return options
      .filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.city.toLowerCase().includes(q) ||
          o.region.toLowerCase().includes(q)
      )
      .slice(0, 200);
  }, [options, query]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function pick(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  const displayLabel = selected
    ? `${selected.city.replace(/_/g, " ")} · ${selected.id}${
        selected.offset ? ` (${selected.offset})` : ""
      }`
    : value || "Select a timezone";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-background px-4 text-left text-sm focus:border-primary focus:outline-none"
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {displayLabel}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="h-10 flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                No timezones match &ldquo;{query}&rdquo;
              </li>
            ) : (
              filtered.map((o) => {
                const active = o.id === value;
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => pick(o.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-medium">{o.city}</span>{" "}
                        <span className="text-xs text-muted-foreground">
                          · {o.id}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {o.offset}
                      </span>
                      {active && <Check className="ml-1 h-4 w-4 text-primary" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          {filtered.length === 200 && (
            <div className="border-t border-border px-3 py-2 text-center text-[11px] text-muted-foreground">
              Showing first 200 — keep typing to narrow down
            </div>
          )}
        </div>
      )}
    </div>
  );
}
