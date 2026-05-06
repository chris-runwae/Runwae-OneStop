"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  HeadphonesIcon,
  Settings,
  Wallet,
  Globe2,
  Map,
  ListTree,
  Boxes,
  Store,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@runwae/ui/lib/cn";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV_SECTIONS: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: "Overview", href: "/overview", icon: LayoutDashboard },
      { label: "Hosts", href: "/hosts", icon: Users },
      { label: "Events", href: "/events", icon: CalendarDays },
      { label: "Bookings", href: "/bookings", icon: BookOpen },
      { label: "Payouts", href: "/payouts", icon: Wallet },
      { label: "Support", href: "/support", icon: HeadphonesIcon },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Destinations", href: "/destinations", icon: Globe2 },
      { label: "Itinerary Templates", href: "/itinerary-templates", icon: Map },
      { label: "Collections", href: "/collections", icon: ListTree },
      { label: "All Users", href: "/users", icon: Boxes },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Vendor", href: "/vendor", icon: Store },
    ],
  },
];

export function AdminSidebar({
  user,
}: {
  user: { name?: string; email?: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();

  const displayName = user.name ?? "Admin";
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

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-surface border-r border-border">
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-black text-white font-bold text-lg font-display">
            R
          </div>
          <span className="font-display text-base font-semibold tracking-tight text-heading">
            Runwae Admin
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.title ?? idx} className="flex flex-col gap-0.5">
            {section.title && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
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
          </div>
        ))}
      </nav>

      <div className="shrink-0 px-3 pb-5">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {initials || "AD"}
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
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
