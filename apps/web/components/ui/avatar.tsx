import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const GRADIENTS: [string, string][] = [
  ["#FF6B6B", "#E91E8C"],
  ["#7B68EE", "#2196F3"],
  ["#FF8C42", "#F5A623"],
  ["#8BC34A", "#26A69A"],
  ["#E91E8C", "#7B68EE"],
  ["#2196F3", "#26A69A"],
  ["#F5A623", "#FF6B6B"],
  ["#26A69A", "#8BC34A"],
];

function gradientFor(name: string): string {
  const [a, b] = GRADIENTS[hashName(name) % GRADIENTS.length]!;
  return `linear-gradient(135deg, ${a}, ${b})`;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const label = name?.trim() || "?";
  const showImage = !!src;
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold",
        sizeMap[size],
        showImage ? "bg-muted text-muted-foreground" : "text-white",
        className
      )}
      style={showImage ? undefined : { backgroundImage: gradientFor(label) }}
    >
      {showImage ? (
        <Image src={src!} alt={name ?? "avatar"} fill className="object-cover" />
      ) : (
        <span aria-label={name}>{initials(label)}</span>
      )}
    </span>
  );
}
