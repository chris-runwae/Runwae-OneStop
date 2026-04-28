"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import {
  Bell,
  Compass,
  Heart,
  Home,
  LogOut,
  Map,
  Menu,
  Plus,
  User,
  Users,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CreateSheet } from "./CreateSheet";

type NavItem = { href: string; label: string; Icon: typeof Home };

// Desktop sidebar nav (full set). Mobile bottom-nav uses a 5-slot subset.
const SIDEBAR_NAV: NavItem[] = [
  { href: "/home",    label: "Home",    Icon: Home },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/trips",   label: "Trips",   Icon: Map },
  { href: "/feed",    label: "Friends", Icon: Users },
  { href: "/saved",   label: "Saved",   Icon: Heart },
  { href: "/profile", label: "Profile", Icon: User },
];

const MOBILE_NAV: NavItem[] = [
  { href: "/home",    label: "Home",    Icon: Home },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/feed",    label: "Friends", Icon: Users },
  { href: "/saved",   label: "Saved",   Icon: Heart },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.getCurrentUser, {});
  const [createOpen, setCreateOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Esc closes the mobile drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Lock body scroll while drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* === Desktop sidebar (lg+) — sticky, non-scrollable === */}
      <aside className="hidden w-60 shrink-0 overflow-hidden border-r border-border bg-card lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <SidebarContent
          pathname={pathname}
          viewer={viewer ?? null}
          onCreate={() => setCreateOpen(true)}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* === Mobile drawer === */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        pathname={pathname}
        viewer={viewer ?? null}
        onCreate={() => {
          setDrawerOpen(false);
          setCreateOpen(true);
        }}
        onSignOut={handleSignOut}
      />

      {/* === Main column === */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar (hidden on desktop) */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <Link
            href="/home"
            className="font-display text-xl font-bold text-primary"
          >
            Runwae
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
            >
              <Bell className="h-5 w-5 text-foreground" />
            </Link>
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-6">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 items-center border-t border-border bg-card pt-1 pb-[max(env(safe-area-inset-bottom),0.5rem)] lg:hidden">
          {MOBILE_NAV.slice(0, 2).map(({ href, label, Icon }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              active={isActive(pathname, href)}
            />
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
          {MOBILE_NAV.slice(2).map(({ href, label, Icon }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              active={isActive(pathname, href)}
            />
          ))}
        </nav>
      </div>

      <CreateSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

type ViewerLike = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
} | null;

function SidebarContent({
  pathname,
  viewer,
  onCreate,
  onSignOut,
}: {
  pathname: string;
  viewer: ViewerLike;
  onCreate: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      {/* Brand + decorative top — non-scrollable */}
      <div className="px-6 py-6">
        <Link
          href="/home"
          className="font-display text-2xl font-bold text-primary"
        >
          Runwae
        </Link>
      </div>

      {/* Spacer pushes the nav + profile to the bottom. */}
      <div className="flex-1" aria-hidden />

      {/* Bottom-pinned block: nav, create, profile, sign-out. */}
      <div className="px-3 pb-4">
        <nav className="space-y-1">
          {SIDEBAR_NAV.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" /> {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={onCreate}
            className="flex w-full items-center gap-3 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" /> Create
          </button>
        </nav>

        <div className="mt-3 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
            >
              <Avatar
                src={viewer?.image ?? undefined}
                name={viewer?.name ?? undefined}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-foreground">
                  {viewer?.name ?? "Profile"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {viewer?.email ?? ""}
                </div>
              </div>
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sign out"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileDrawer({
  open,
  onClose,
  pathname,
  viewer,
  onCreate,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  viewer: ViewerLike;
  onCreate: () => void;
  onSignOut: () => void;
}) {
  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className={cn(
          "absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col overflow-hidden border-r border-border bg-card shadow-xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent
          pathname={pathname}
          viewer={viewer}
          onCreate={onCreate}
          onSignOut={onSignOut}
        />
      </aside>
    </div>
  );
}

function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
