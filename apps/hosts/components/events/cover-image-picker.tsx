"use client";

import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { Camera, ImageIcon, RefreshCw, Search, Sparkles } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@runwae/ui/components/tabs";
import { Skeleton } from "@runwae/ui/components/skeleton";
import { Button } from "@runwae/ui/components/button";
import { cn } from "@runwae/ui/lib/cn";
import { api } from "@/convex/_generated/api";
import { UploadDropzone } from "@/lib/uploadthing";

type UnsplashResult = {
  id: string;
  url: string;
  thumbUrl: string;
  altDescription: string | null;
  photographerName: string;
  photographerUrl: string;
  attributionUrl: string;
};

interface CoverImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  seedQuery?: string;
}

export function CoverImagePicker({
  value,
  onChange,
  seedQuery = "",
}: CoverImagePickerProps) {
  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted/30",
          !value && "border-dashed"
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Event cover"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-8" />
            <p className="text-sm font-medium">No cover image yet</p>
            <p className="text-xs">Upload a photo or pick one from Unsplash.</p>
          </div>
        )}
        {value && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 h-7 gap-1 px-2 text-xs"
          >
            <RefreshCw className="size-3" />
            Change
          </Button>
        )}
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-2">
            <Camera className="size-3.5" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="unsplash" className="gap-2">
            <Sparkles className="size-3.5" />
            Unsplash
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-2">
          <UploadDropzone
            endpoint="eventCover"
            appearance={{
              container:
                "rounded-xl border border-dashed border-border bg-muted/20 ut-uploading:opacity-70",
              label: "text-sm text-body",
              allowedContent: "text-xs text-muted-foreground",
              button:
                "ut-ready:bg-primary ut-ready:text-primary-foreground ut-uploading:cursor-not-allowed bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-sm font-medium",
            }}
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.url;
              if (url) onChange(url);
            }}
            onUploadError={(err) => {
              console.error("[upload] error", err);
            }}
          />
        </TabsContent>

        <TabsContent value="unsplash">
          <UnsplashTab
            seedQuery={seedQuery}
            selectedUrl={value}
            onSelect={onChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UnsplashTab({
  seedQuery,
  selectedUrl,
  onSelect,
}: {
  seedQuery: string;
  selectedUrl: string;
  onSelect: (url: string) => void;
}) {
  const search = useAction(api.unsplash.searchPhotos);
  const trackDownload = useAction(api.unsplash.trackDownload);
  const [query, setQuery] = useState(seedQuery);
  const [results, setResults] = useState<UnsplashResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

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
        setResults(items as UnsplashResult[]);
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

  function handlePick(p: UnsplashResult) {
    onSelect(p.url);
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
        <div className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          <Sparkles className="mx-auto mb-1 h-4 w-4 opacity-60" />
          {query.trim()
            ? "No photos for that search."
            : "Type a destination or theme to see photos."}
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
                    <span className="absolute right-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
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
            . Photographer credit is preserved on the event page.
          </p>
        </>
      )}
    </div>
  );
}
