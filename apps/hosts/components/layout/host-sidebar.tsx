"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  TrendingUp,
  Users,
  BookOpen,
  Settings,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@runwae/ui/lib/cn";

type NavItem = { label: string; href: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Bookings", href: "/bookings", icon: BookOpen },
  { label: "Earnings", href: "/earnings", icon: TrendingUp },
  { label: "Payouts", href: "/payouts", icon: Wallet },
  { label: "Attendees", href: "/attendee-insights", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function HostSidebar({
  user,
  open = false,
  onClose,
}: {
  user: { name?: string; email?: string };
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();

  const displayName = user.name ?? "Host";
  const email = user.email ?? "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  // Close drawer on route change.
  useEffect(() => {
    if (open && onClose) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ESC closes the drawer.
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while drawer is open on mobile.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-surface border-r border-border transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:z-30"
        )}
        aria-label="Main menu"
      >
        <div className="flex h-16 shrink-0 items-center px-6">
          <Link href="/overview" className="flex items-center gap-2">
            <Image
              src="/logo-dark.png"
              alt="Runwae"
              width={120}
              height={30}
              priority
              className="h-7 w-auto"
            />
            <span className="font-display text-base font-semibold tracking-tight text-muted-foreground">
              / Hosts
            </span>
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="ml-auto grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-heading transition-colors lg:hidden"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-heading"
                  : "text-muted-foreground hover:text-body hover:bg-muted/40"
              )}
            >
              {isActive && (
                <span className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "size-[18px] shrink-0 transition-colors",
                  isActive
                    ? "text-heading"
                    : "text-muted-foreground group-hover:text-body"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 px-3 pb-5">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {initials || "H"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-heading">
                {displayName}
              </p>
              {email && (
                <p className="truncate text-xs text-muted-foreground">
                  {email}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-error-light px-3 py-2 text-sm font-medium text-error hover:bg-error/10 transition-colors"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </div>
      </aside>
    </>
  );
}
