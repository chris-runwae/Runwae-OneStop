"use client";

import { ROUTES } from "@/app/routes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  BaggageClaimIcon,
  Calendar1Icon,
  CardSimIcon,
  ClipboardListIcon,
  HomeIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  { to: ROUTES.host.overview, label: "Overview", icon: HomeIcon },
  { to: ROUTES.host.events, label: "My Events", icon: Calendar1Icon },
  { to: ROUTES.host.bookings, label: "Bookings", icon: ClipboardListIcon },
  { to: ROUTES.host.earnings, label: "Earnings", icon: BaggageClaimIcon },
  { to: ROUTES.host.payouts, label: "Payouts", icon: CardSimIcon },
  {
    to: ROUTES.host.attendeeInsights,
    label: "Attendee Insights",
    icon: UserIcon,
  },
  { to: ROUTES.host.settings, label: "Settings", icon: SettingsIcon },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        role="presentation"
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "flex w-[284px] shrink-0 flex-col border-r border-border-light bg-surface transition-transform duration-200 ease-out",
          "fixed inset-y-0 left-0 z-50 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Mobile: close button */}
        <div className="flex items-center justify-between border-b border-border-light px-4 py-3 lg:hidden">
          <Image
            src="/logo-dark.png"
            alt="Runwae"
            width={120}
            height={30}
            className="h-8 w-auto"
            priority
          />
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-border-light hover:text-body focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close menu"
          >
            <XIcon className="size-5" aria-hidden />
          </button>
        </div>

        {/* Logo (desktop) */}
        <div className="hidden px-6 pt-6 lg:block">
          <Image
            src="/logo-dark.png"
            alt="Runwae"
            width={140}
            height={35}
            className="h-[35px] w-auto"
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-1 flex-col px-4 lg:mt-[46px] lg:px-6">
          <ul className="flex flex-col gap-1 lg:gap-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <Link
                    href={item.to}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-4 py-3 font-display text-base transition-colors hover:bg-border-light lg:px-6 lg:py-3.5",
                      isActive && "bg-border-light font-medium",
                    )}
                  >
                    <item.icon className="size-5 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* User card */}
          <div className="mt-auto mb-4 flex flex-col gap-3 rounded-xl border border-border bg-surface px-2 py-3 lg:mb-6">
            <div className="flex items-start gap-2">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  JL
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <span className="block truncate font-display text-base font-bold leading-6 text-heading">
                  James Lucy
                </span>
                <span className="block truncate text-sm leading-5 text-muted-foreground">
                  jameslucy@gmail.com
                </span>
              </div>
            </div>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-error-light px-6 py-3.5 transition-colors hover:bg-error-light/80"
            >
              <LogOutIcon className="size-5 shrink-0 text-error" aria-hidden />
              <span className="font-display text-base font-medium text-error">
                Logout
              </span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
