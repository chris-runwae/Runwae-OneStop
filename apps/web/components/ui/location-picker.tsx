"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronsUpDown, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type LocationValue = {
  destinationLabel: string;
  coords?: { lat: number; lng: number };
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

function shortenLabel(r: NominatimResult): string {
  const a = r.address;
  if (!a) return r.display_name.split(",").slice(0, 3).join(",").trim();
  const place = a.city ?? a.town ?? a.village ?? a.state ?? "";
  const country = a.country ?? "";
  if (place && country) return `${place}, ${country}`;
  return r.display_name.split(",").slice(0, 3).join(",").trim();
}

export function LocationPicker({
  value,
  onChange,
  className,
  placeholder = "Search a city or country…",
}: {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(value.destinationLabel);
  const [results, setResults] = useState<NominatimResult[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!open) setTerm(value.destinationLabel);
  }, [value.destinationLabel, open]);

  useEffect(() => {
    if (!open) return;
    const q = term.trim();
    if (q.length < 2) {
      setResults(undefined);
      setLoading(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const myReq = ++reqIdRef.current;
      try {
        const url = `${NOMINATIM_URL}?q=${encodeURIComponent(
          q
        )}&format=json&addressdetails=1&limit=6`;
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Nominatim ${res.status}`);
        const data = (await res.json()) as NominatimResult[];
        if (myReq === reqIdRef.current) {
          setResults(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("[location-picker] geocoding failed", err);
        if (myReq === reqIdRef.current) {
          setResults([]);
          setLoading(false);
        }
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [term, open]);

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

  function pick(r: NominatimResult) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    const label = shortenLabel(r);
    onChange({
      destinationLabel: label,
      coords: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined,
    });
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

          <ul className="max-h-64 overflow-y-auto py-1">
            {term.trim().length < 2 ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                Type a place name to search.
              </li>
            ) : loading ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">Searching…</li>
            ) : !results || results.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                No matches for &ldquo;{term.trim()}&rdquo;.
              </li>
            ) : (
              results.map((r) => (
                <li key={r.place_id}>
                  <button
                    type="button"
                    onClick={() => pick(r)}
                    className="flex w-full items-start gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
                  >
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {shortenLabel(r)}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {r.display_name}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>

          <p className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
            Place data &copy; OpenStreetMap contributors
          </p>
        </div>
      )}
    </div>
  );
}
