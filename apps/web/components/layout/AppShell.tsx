"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bell, Compass, Home, Map, Plus, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CreateSheet } from "./CreateSheet";

type NavItem = { href: string; label: string; Icon: typeof Home };

const NAV: NavItem[] = [
  { href: "/home",    label: "Home",    Icon: Home },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/trips",   label: "Trips",   Icon: Map },
  { href: "/profile", label: "Profile", Icon: User },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const viewer = useQuery(api.users.getCurrentUser, {});
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* === Desktop sidebar (lg+) === */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="px-6 py-6">
          <Link href="/home" className="font-display text-2xl font-bold text-primary">Runwae</Link>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-5 w-5" /> {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" /> Create
          </button>
        </nav>
        <div className="border-t border-border px-3 py-4">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
          >
            <Avatar src={viewer?.image} name={viewer?.name ?? undefined} size="md" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{viewer?.name ?? "Profile"}</div>
              <div className="truncate text-xs text-muted-foreground">{viewer?.email ?? ""}</div>
            </div>
          </Link>
        </div>
      </aside>

      {/* === Main column === */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar (hidden on desktop) */}
        <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <Link href="/home" className="font-display text-xl font-bold text-primary">Runwae</Link>
          <div className="flex items-center gap-3">
            <button aria-label="Notifications" className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
              <Bell className="h-5 w-5 text-foreground" />
            </button>
            <Link href="/profile" aria-label="Profile">
              <Avatar src={viewer?.image} name={viewer?.name ?? undefined} size="sm" />
            </Link>
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-6">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 items-center border-t border-border bg-card pt-1 pb-[max(env(safe-area-inset-bottom),0.5rem)] lg:hidden">
          {NAV.slice(0, 2).map(({ href, label, Icon }) => (
            <NavLink key={href} href={href} label={label} Icon={Icon} active={isActive(pathname, href)} />
          ))}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              aria-label="Create"
              className="-mt-6 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
          {NAV.slice(2).map(({ href, label, Icon }) => (
            <NavLink key={href} href={href} label={label} Icon={Icon} active={isActive(pathname, href)} />
          ))}
        </nav>
      </div>

      <CreateSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function NavLink({ href, label, Icon, active }: { href: string; label: string; Icon: typeof Home; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
