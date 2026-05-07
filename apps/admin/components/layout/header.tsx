"use client";

import { Search, Bell, Menu } from "lucide-react";

export function AdminHeader({
  user,
  onMenuClick,
}: {
  user: { name?: string; email?: string };
  onMenuClick?: () => void;
}) {
  const displayName = user.name ?? "Admin";
  const email = user.email ?? "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-surface px-4 sm:gap-6 sm:px-6">
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
      <p className="hidden shrink-0 font-display text-lg font-bold text-heading sm:block">
        Welcome {displayName.split(" ")[0]}&nbsp;👋
      </p>

      <div className="flex flex-1 justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search…"
            className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm text-body placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-body ring-1 ring-border">
          {initials || "AD"}
        </div>
        <div className="leading-snug">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-heading">
              {displayName}
            </span>
            <span className="text-xs font-medium text-primary">Super Admin</span>
          </div>
          {email && (
            <p className="text-xs text-muted-foreground">{email}</p>
          )}
        </div>
        <button
          type="button"
          className="ml-1 flex size-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-heading transition-colors"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>
      </div>
    </header>
  );
}
