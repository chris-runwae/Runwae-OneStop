import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";

interface AvatarStackProps {
  users: Array<{ name?: string; avatarUrl?: string | null }>;
  max?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}

const overflowSize: Record<NonNullable<AvatarStackProps["size"]>, string> = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
};

export function AvatarStack({ users, max = 4, size = "sm", className }: AvatarStackProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((user, i) => (
        <Avatar
          key={i}
          src={user.avatarUrl}
          name={user.name}
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background",
            overflowSize[size]
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
