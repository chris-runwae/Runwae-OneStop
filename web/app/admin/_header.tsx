"use client";

import { Search, Bell } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function AdminHeader() {
  const { admin } = useAdminAuth();

  const displayName = admin?.name ?? "Admin";
  const email = admin?.email ?? "admin@runwae.com";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-6 border-b border-border bg-white px-6">
      {/* Welcome */}
      <p className="shrink-0 font-display text-lg font-bold text-black">
        Welcome Admin&nbsp;👋
      </p>

      {/* Search */}
      <div className="flex flex-1 justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search"
            className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm text-body placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </div>

      {/* Right: user + bell */}
      <div className="flex shrink-0 items-center gap-3">
        {/* Avatar */}
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-body ring-1 ring-border">
          {initials}
        </div>

        {/* Name + role + email */}
        <div className="leading-snug">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-black">{displayName}</span>
            <span className="text-xs font-medium text-primary">Super Admin</span>
          </div>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>

        {/* Bell */}
        <button
          type="button"
          className="ml-1 flex size-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-black transition-colors"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>
      </div>
    </header>
  );
}
