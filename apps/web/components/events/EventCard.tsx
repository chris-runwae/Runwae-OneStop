"use client";

import Image from "next/image";
import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

function getCategoryEmoji(category: string | undefined) {
  const cat = category?.toLowerCase() ?? "";
  if (cat.includes("food") || cat.includes("culinary")) return "🍽️";
  if (cat.includes("music") || cat.includes("fest")) return "🎶";
  if (cat.includes("art") || cat.includes("exhibition") || cat.includes("cultural") || cat.includes("culture")) return "🌈";
  if (cat.includes("adventure") || cat.includes("outdoor")) return "🏜️";
  if (cat.includes("water") || cat.includes("boat") || cat.includes("cruise")) return "⛵";
  if (cat.includes("sport")) return "🏉";
  return "✨";
}

function formatDateBadge(epochMs: number, timezone?: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: timezone ?? "UTC",
  }).format(new Date(epochMs));
}

type EventLike = Pick<
  Doc<"events">,
  | "_id"
  | "name"
  | "slug"
  | "imageUrl"
  | "imageUrls"
  | "category"
  | "startDateUtc"
  | "locationName"
  | "timezone"
>;

interface EventCardProps {
  event: EventLike;
  index?: number;
  fullWidth?: boolean;
  inlineEmoji?: boolean;
}

export function EventCard({
  event,
  index = 0,
  fullWidth = false,
  inlineEmoji = false,
}: EventCardProps) {
  const rotation = index % 2 === 0 ? "-rotate-[1.5deg]" : "rotate-[1.5deg]";
  const emoji = getCategoryEmoji(event.category ?? undefined);
  const title = event.name || "Untitled Event";
  const image = event.imageUrl ?? event.imageUrls?.[0];
  const date = formatDateBadge(event.startDateUtc, event.timezone);
  const location = event.locationName?.split(",")[0] ?? "";

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group block",
        fullWidth ? "w-full" : "mr-3 w-[128px] flex-shrink-0"
      )}
    >
      <div className="relative w-full">
        <div
          className={cn(
            "relative overflow-hidden rounded-[15px] bg-card shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform group-hover:scale-[1.015]",
            fullWidth ? "mx-auto aspect-[4/4.5] w-[96%]" : "h-[145px] w-[128px]",
            rotation
          )}
        >
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes={fullWidth ? "(min-width: 1024px) 320px, 90vw" : "128px"}
              className="rounded-[11px] border-[4px] border-card object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-foreground/10" />
          )}
        </div>
        {!inlineEmoji && (
          <span
            className="pointer-events-none absolute right-[15px] top-[40%] text-4xl"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.18))" }}
          >
            {emoji}
          </span>
        )}
      </div>

      <div className="mb-1 mt-2 flex items-center gap-x-1">
        <span className="line-clamp-2 flex-1 font-display text-[14px] font-extrabold leading-tight text-foreground">
          {title}
        </span>
        {inlineEmoji && <span className="text-[14px]">{emoji}</span>}
      </div>

      <div className="flex items-center text-[12px] text-muted-foreground">
        <span className="border-r border-foreground/15 pr-1.5">{date}</span>
        <span className="line-clamp-1 flex-1 pl-1.5">{location}</span>
      </div>
    </Link>
  );
}
