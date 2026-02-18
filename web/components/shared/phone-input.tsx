import { cn } from "@/lib/utils";

export function PhoneInput({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex w-full", className)}>
      <div className="flex h-11 w-full overflow-hidden rounded-lg border border-input bg-surface shadow-xs focus-within:ring-2 focus-within:ring-ring/50">
        <span className="flex items-center gap-1 border-r border-input bg-muted/30 px-3 text-sm text-muted-foreground">
          +234
          <svg
            className="size-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
        <input
          type="tel"
          placeholder="Phone number"
          name="phone"
          className={cn(
            "h-full flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground md:text-sm",
          )}
        />
      </div>
    </div>
  );
}
