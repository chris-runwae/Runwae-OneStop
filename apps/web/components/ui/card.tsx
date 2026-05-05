import { cn } from "@/lib/utils";
import Image from "next/image";
import type { HTMLAttributes } from "react";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("overflow-hidden rounded-2xl bg-card border border-border", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardImageProps {
  src: string;
  alt: string;
  aspectRatio?: "video" | "square" | "wide";
  className?: string;
}

export function CardImage({ src, alt, aspectRatio = "video", className }: CardImageProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        aspectRatio === "video" && "aspect-video",
        aspectRatio === "square" && "aspect-square",
        aspectRatio === "wide" && "aspect-[3/2]",
        className
      )}
    >
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}
