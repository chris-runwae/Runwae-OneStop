"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { ArrowLeft, ExternalLink, MapPin, Star } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

type Detail = {
  provider: string;
  apiRef: string;
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  externalUrl?: string;
  locationName?: string;
  address?: string;
  coords?: { lat: number; lng: number };
  rating?: number;
  reviewCount?: number;
  gallery?: string[];
  highlights?: string[];
  amenities?: string[];
  duration?: string;
};

function uiCategoryToType(cat: string) {
  switch (cat) {
    case "stay": return "hotel";
    case "tour": return "tour";
    case "adventure": return "activity";
    case "event": return "event";
    case "eat": return "restaurant";
    case "ride": return "transport";
    case "fly": return "flight";
    default: return "other";
  }
}

export function DetailClient({
  provider, apiRef, category, tripId,
}: {
  provider: string;
  apiRef: string;
  category: string;
  tripId?: string;
}) {
  const getDetail = useAction(api.discovery.getDetail);
  const viewer = useQuery(api.users.getCurrentUser, {});
  const addSaved = useMutation(api.saved_items.addSavedItem);
  const [detail, setDetail] = useState<Detail | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const d = await getDetail({ provider, apiRef, category });
        if (!cancelled) setDetail(d as Detail | null);
      } catch (err) {
        console.error("[detail] fetch failed", err);
        if (!cancelled) setDetail(null);
      }
    })();
    return () => { cancelled = true; };
  }, [getDetail, provider, apiRef, category]);

  if (detail === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-[16/9] rounded-2xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32" />
      </div>
    );
  }
  if (detail === null) {
    return (
      <div className="rounded-2xl border border-dashed border-foreground/15 px-6 py-16 text-center">
        <p className="text-sm text-foreground/60">We couldn't load this item right now.</p>
        <Link href="/explore" className="mt-3 inline-block text-sm font-semibold text-primary">Back to Explore</Link>
      </div>
    );
  }

  async function handleSave() {
    if (!tripId || !detail || saving) return;
    setSaving(true);
    try {
      await addSaved({
        tripId: tripId as Id<"trips">,
        type: uiCategoryToType(detail.category) as any,
        title: detail.title,
        description: detail.description,
        imageUrl: detail.imageUrl,
        price: detail.price,
        currency: detail.currency,
        externalUrl: detail.externalUrl,
        locationName: detail.locationName,
        coords: detail.coords,
        apiSource: detail.provider,
        apiRef: detail.apiRef,
        isManual: false,
      });
      setSavedOk(true);
    } finally {
      setSaving(false);
    }
  }

  const displayCurrency = viewer?.preferredCurrency;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={tripId ? `/trips` : "/explore"} className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <span className="rounded-full bg-foreground/5 px-3 py-1 text-[11px] uppercase tracking-wider text-foreground/60">
          {detail.provider} · {detail.category}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl bg-foreground/5">
        {detail.imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={detail.imageUrl} alt={detail.title} className="aspect-[16/9] w-full object-cover" />
        )}
      </div>

      {detail.gallery && detail.gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {detail.gallery.slice(0, 8).map((url, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={i} src={url} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
          ))}
        </div>
      )}

      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-foreground">{detail.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60">
          {detail.rating != null && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {detail.rating.toFixed(1)}
              {detail.reviewCount ? <span className="text-foreground/40">({detail.reviewCount})</span> : null}
            </span>
          )}
          {detail.locationName && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {detail.locationName}
            </span>
          )}
          {detail.duration && <span>· {detail.duration}</span>}
        </div>
      </header>

      {detail.description && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
          {detail.description}
        </p>
      )}

      {detail.highlights && detail.highlights.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold">Highlights</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {detail.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl bg-foreground/5 p-3 text-sm">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {detail.amenities && detail.amenities.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {detail.amenities.map((a, i) => (
              <span key={i} className="rounded-full bg-foreground/5 px-3 py-1 text-xs">{a}</span>
            ))}
          </div>
        </section>
      )}

      {detail.address && (
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold">Location</h2>
          <p className="text-sm text-foreground/70">{detail.address}</p>
        </section>
      )}

      <div className="sticky bottom-4 z-10 flex flex-col gap-2 rounded-2xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          {detail.price != null && detail.currency ? (
            <div>
              <span className="text-[11px] uppercase tracking-wider text-foreground/60">From</span>
              <div className="font-display text-2xl font-bold text-foreground">
                {formatCurrency(detail.price, detail.currency, displayCurrency)}
              </div>
            </div>
          ) : (
            <span className="text-sm text-foreground/60">Pricing on request</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {tripId && (
            <Button variant="outline" onClick={handleSave} isLoading={saving} disabled={saving || savedOk}>
              {savedOk ? "Saved" : "Add to Saved"}
            </Button>
          )}
          {detail.externalUrl && (
            <a href={detail.externalUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Book now <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
