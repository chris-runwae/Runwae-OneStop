"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "convex/react";
import { CalendarDays, Wand2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type TemplateLike = Pick<
  Doc<"itinerary_templates">,
  "_id" | "title" | "coverImageUrl" | "durationDays" | "category" | "description"
>;

interface FeaturedItineraryCardProps {
  template: TemplateLike;
  fallbackImage?: string;
  className?: string;
}

export function FeaturedItineraryCard({
  template,
  fallbackImage,
  className,
}: FeaturedItineraryCardProps) {
  const router = useRouter();
  const createFromTemplate = useMutation(api.trips.createFromTemplate);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cover = template.coverImageUrl ?? fallbackImage;

  async function handlePlan() {
    setPending(true);
    setError(null);
    try {
      const result = await createFromTemplate({ templateId: template._id });
      router.push(`/trips/${result.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create trip");
      setPending(false);
    }
  }

  return (
    <div
      className={cn(
        "group flex w-[260px] shrink-0 flex-col overflow-hidden rounded-[18px] border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.05)]",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={template.title}
            fill
            sizes="260px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
          <CalendarDays className="h-3 w-3" /> {template.durationDays}d
        </span>
        {template.category && (
          <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
            {template.category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <h3 className="line-clamp-2 font-display text-[15px] font-extrabold text-foreground">
          {template.title}
        </h3>
        {template.description && (
          <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
            {template.description}
          </p>
        )}
        {error && (
          <p className="mt-1 text-[11px] text-error">{error}</p>
        )}
        <button
          type="button"
          onClick={handlePlan}
          disabled={pending}
          className="mt-3 inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          <Wand2 className="h-3 w-3" />
          {pending ? "Planning…" : "Plan a trip from this"}
        </button>
      </div>
    </div>
  );
}
