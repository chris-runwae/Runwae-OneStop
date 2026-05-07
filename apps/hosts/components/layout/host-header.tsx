"use client";

import Link from "next/link";
import { Plus, Bell, Menu } from "lucide-react";
import { Button } from "@runwae/ui/components/button";

export function HostHeader({
  user,
  onMenuClick,
}: {
  user: { name?: string; email?: string };
  onMenuClick?: () => void;
}) {
  const displayName = user.name ?? "Host";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:gap-6 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-heading transition-colors lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        )}
        <p className="truncate font-display text-lg font-bold text-heading">
          Welcome {displayName.split(" ")[0]}&nbsp;👋
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/events/create">
            <Plus className="size-4" />
            New event
          </Link>
        </Button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-heading transition-colors"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>
        <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-bold text-body ring-1 ring-border">
          {initials || "H"}
        </div>
      </div>
    </header>
  );
}
