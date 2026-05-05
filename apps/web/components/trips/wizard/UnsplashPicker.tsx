"use client";

import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { Search, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type Photo = Awaited<
  ReturnType<typeof useAction<typeof api.unsplash.searchPhotos>>
>;

type Result = {
  id: string;
  url: string;
  thumbUrl: string;
  altDescription: string | null;
  photographerName: string;
  photographerUrl: string;
  attributionUrl: string;
};

interface UnsplashPickerProps {
  seedQuery: string;
  selectedUrl: string;
  onSelect: (url: string) => void;
}

export function UnsplashPicker({
  seedQuery,
  selectedUrl,
  onSelect,
}: UnsplashPickerProps) {
  const search = useAction(api.unsplash.searchPhotos);
  const trackDownload = useAction(api.unsplash.trackDownload);
  const [query, setQuery] = useState(seedQuery);
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  // Keep `query` in sync with the seed when the user hasn't typed yet.
  useEffect(() => {
    if (!touched) setQuery(seedQuery);
  }, [seedQuery, touched]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    search({ query: q, perPage: 12, orientation: "landscape" })
      .then((items) => {
        if (cancelled) return;
        setResults(items as Result[]);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, search]);

  function handlePick(p: Result) {
    onSelect(p.url);
    // Per Unsplash API guidelines, fire-and-forget the download endpoint
    // when a photo is actually used.
    void trackDownload({ photoId: p.id });
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setTouched(true);
            setQuery(e.target.value);
          }}
          placeholder="Search Unsplash for a cover…"
          className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
          ))}
        </div>
      ) : results === null || results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-[12px] text-muted-foreground">
          <Sparkles className="mx-auto mb-1 h-4 w-4 opacity-60" />
          {query.trim()
            ? "No photos for that search."
            : "Type a destination to see photos."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {results.map((p) => {
              const on = selectedUrl === p.url;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePick(p)}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border-2 transition-all",
                    on
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent hover:border-border"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbUrl}
                    alt={p.altDescription ?? "Unsplash photo"}
                    className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-[1.02]"
                  />
                  {on && (
                    <span className="absolute right-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[10.5px] text-muted-foreground">
            Photos from{" "}
            <a
              href="https://unsplash.com?utm_source=runwae&utm_medium=referral"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Unsplash
            </a>
            . Photographer credit is preserved on the trip page.
          </p>
        </>
      )}
    </div>
  );
}

// Type-noop so the unused `Photo` alias doesn't trip eslint when imported.
export type _UnsplashPhotoMarker = Photo;
