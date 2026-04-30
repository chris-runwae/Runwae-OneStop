"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  HeadphonesIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { label: "Hosts", href: "/admin/hosts", icon: Users },
  // { label: "Vendors", href: "/admin/vendor", icon: Store },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
  { label: "Bookings", href: "/admin/bookings", icon: BookOpen },
  { label: "Support", href: "/admin/support", icon: HeadphonesIcon },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { admin, signOut } = useAdminAuth();
  const router = useRouter();

  const displayName = admin?.name ?? "Admin";
  const email = admin?.email ?? "admin@runwae.com";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleSignOut = () => {
    signOut();
    router.replace("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-white border-r border-border">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-black text-white font-bold text-lg font-display">
            R
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-black"
                  : "text-muted-foreground hover:text-body hover:bg-muted/40",
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon
                className={cn(
                  "size-5 shrink-0 transition-colors",
                  isActive ? "text-black" : "text-muted-foreground group-hover:text-body",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="shrink-0 px-3 pb-5">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-black">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-100 transition-colors"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
