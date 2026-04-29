"use client";

import * as React from "react";
import Image from "next/image";
import { GripVertical, X } from "lucide-react";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SingleImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  endpoint: "destinationHero" | "destinationGallery" | "templateItemImage";
  label?: string;
  className?: string;
}

export function SingleImageUpload({
  value,
  onChange,
  endpoint,
  label,
  className,
}: SingleImageUploadProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <div className="text-sm font-medium">{label}</div>}
      {value ? (
        <div className="relative h-48 w-full overflow-hidden rounded-md border border-border bg-muted">
          <Image
            src={value}
            alt="Hero preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
            unoptimized
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2"
          >
            Remove
          </Button>
        </div>
      ) : (
        <UploadDropzone
          endpoint={endpoint}
          onUploadBegin={(name) => {
            // [ut-diag] DELETE ME after verifying the callback fires.
            console.log("[ut][hero] begin", name);
          }}
          onUploadProgress={(p) => {
            console.log("[ut][hero] progress", p);
          }}
          onClientUploadComplete={(res) => {
            console.log("[ut][hero] complete", res);
            if (res?.[0]?.serverData?.url) {
              onChange(res[0].serverData.url);
              toast.success("Hero image uploaded");
            }
          }}
          onUploadError={(err) => {
            console.error("[ut][hero] error", err);
            toast.error(err.message || "Upload failed");
          }}
          appearance={{
            container:
              "border border-dashed border-border rounded-md bg-muted/30 py-6",
            label: "text-foreground text-sm",
            allowedContent: "text-muted-foreground text-xs",
            button:
              "bg-primary text-primary-foreground rounded-md text-sm h-9 px-4 hover:bg-primary/90 ut-uploading:opacity-60",
          }}
        />
      )}
    </div>
  );
}

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  endpoint: "destinationGallery";
  label?: string;
  className?: string;
}

export function GalleryUpload({
  value,
  onChange,
  endpoint,
  label,
  className,
}: GalleryUploadProps) {
  const [draggingIdx, setDraggingIdx] = React.useState<number | null>(null);

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= value.length) return;
    const next = value.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <div className="text-sm font-medium">{label}</div>}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              draggable
              onDragStart={() => setDraggingIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggingIdx !== null) move(draggingIdx, idx);
                setDraggingIdx(null);
              }}
              onDragEnd={() => setDraggingIdx(null)}
              className={cn(
                "group relative aspect-video overflow-hidden rounded-md border border-border bg-muted",
                draggingIdx === idx && "opacity-40"
              )}
            >
              <Image
                src={url}
                alt={`Gallery image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 200px"
                unoptimized
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-black/40 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex items-center gap-1">
                  <GripVertical className="h-3 w-3" /> {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== idx))}
                  aria-label="Remove image"
                  className="rounded-sm bg-black/60 p-1 hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <UploadDropzone
        endpoint={endpoint}
        onUploadBegin={(name) => {
          // [ut-diag] DELETE ME after verifying the callback fires.
          console.log("[ut][gallery] begin", name);
        }}
        onUploadProgress={(p) => {
          console.log("[ut][gallery] progress", p);
        }}
        onClientUploadComplete={(res) => {
          console.log("[ut][gallery] complete", res);
          if (!res?.length) return;
          const newUrls = res
            .map((r) => r.serverData?.url)
            .filter((u): u is string => Boolean(u));
          onChange([...value, ...newUrls]);
          toast.success(`Added ${newUrls.length} image(s) to gallery`);
        }}
        onUploadError={(err) => {
          console.error("[ut][gallery] error", err);
          toast.error(err.message || "Upload failed");
        }}
        appearance={{
          container:
            "border border-dashed border-border rounded-md bg-muted/30 py-4",
          label: "text-foreground text-sm",
          allowedContent: "text-muted-foreground text-xs",
          button:
            "bg-primary text-primary-foreground rounded-md text-sm h-9 px-4 hover:bg-primary/90 ut-uploading:opacity-60",
        }}
      />
    </div>
  );
}
