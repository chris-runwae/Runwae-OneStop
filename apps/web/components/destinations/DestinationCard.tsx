import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type DestinationLike = Pick<
  Doc<"destinations">,
  | "_id"
  | "name"
  | "country"
  | "slug"
  | "heroImageUrl"
  | "ratingAverage"
  | "tags"
>;

interface DestinationCardProps {
  destination: DestinationLike;
  fullWidth?: boolean;
  width?: number;
  imageHeight?: number;
  className?: string;
}

export function DestinationCard({
  destination,
  fullWidth = false,
  width = 170,
  imageHeight = 110,
  className,
}: DestinationCardProps) {
  const tag = destination.tags[0];
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group block overflow-hidden rounded-[18px] bg-card text-left transition-transform hover:-translate-y-0.5",
        fullWidth ? "w-full" : "shrink-0",
        className
      )}
      style={fullWidth ? undefined : { width }}
    >
      <div
        className="relative w-full overflow-hidden rounded-[18px]"
        style={{ height: imageHeight }}
      >
        <Image
          src={destination.heroImageUrl}
          alt={destination.name}
          fill
          sizes={fullWidth ? "(min-width: 1024px) 480px, 90vw" : `${width}px`}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        {tag && (
          <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            {tag}
          </span>
        )}
      </div>
      <div className="px-1 pt-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="line-clamp-1 font-display text-[15px] font-extrabold text-foreground">
            {destination.name}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/70">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {destination.ratingAverage.toFixed(1)}
          </span>
        </div>
        <div className="mt-0.5 inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {destination.country}
        </div>
      </div>
    </Link>
  );
}
