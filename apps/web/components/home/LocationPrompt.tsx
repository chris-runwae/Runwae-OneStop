"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { MapPin, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { nearestIata } from "@/lib/iata";

const NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse";

type ReverseAddress = {
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
  country_code?: string;
};

async function reverseGeocode(coords: { lat: number; lng: number }) {
  const url = `${NOMINATIM_REVERSE}?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) return null;
  const json = (await res.json()) as { address?: ReverseAddress };
  const a = json.address ?? {};
  const city = a.city ?? a.town ?? a.village ?? a.county ?? a.state ?? null;
  const country = a.country ?? null;
  return { city, country };
}

export function LocationPrompt({ onDone }: { onDone?: () => void }) {
  const setHomeLocation = useMutation(api.users.setHomeLocation);
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (dismissed) return null;

  async function handleEnable() {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported in this browser.");
      return;
    }
    setBusy(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const info = await reverseGeocode(coords);
          const iata = nearestIata(coords, info?.city ?? undefined) ?? undefined;
          await setHomeLocation({
            coords,
            city: info?.city ?? undefined,
            country: info?.country ?? undefined,
            iata,
          });
          setDismissed(true);
          onDone?.();
        } catch (err) {
          setError("Could not save your location. Try again.");
        } finally {
          setBusy(false);
        }
      },
      (err) => {
        setBusy(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Permission denied. Set your location in profile to enable nearby suggestions.");
        } else {
          setError("Could not read your location.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 }
    );
  }

  return (
    <div className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-3 lg:mx-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
        <MapPin className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-foreground">
          Set your home location
        </div>
        <div className="mt-0.5 text-[11.5px] text-muted-foreground">
          {error ?? "Better flight + nearby tour suggestions. We only use it to power Discover."}
        </div>
      </div>
      <button
        type="button"
        onClick={handleEnable}
        disabled={busy}
        className="inline-flex h-8 shrink-0 items-center rounded-full bg-primary px-3 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {busy ? "…" : "Enable"}
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
