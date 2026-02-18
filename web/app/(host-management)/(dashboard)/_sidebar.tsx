"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  BaggageClaimIcon,
  Calendar1Icon,
  CardSimIcon,
  HomeIcon,
  LogOutIcon,
  SettingsIcon,
  User2Icon,
  UserIcon,
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
  { to: "/overview", label: "Overview", icon: HomeIcon },
  { to: "/events", label: "My Events", icon: Calendar1Icon },
  { to: "/earnings", label: "Earnings", icon: BaggageClaimIcon },
  { to: "/payouts", label: "Payouts", icon: CardSimIcon },
  { to: "/attendee-insights", label: "Attendee Insights", icon: UserIcon },
  { to: "/team-access", label: "Team Access", icon: User2Icon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[284px] shrink-0 flex-col border-r border-border-light bg-surface">
      {/* Logo */}
      <div className="px-6 pt-6">
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
      <nav className="mt-[46px] flex flex-1 flex-col px-6">
        <ul className="flex flex-col gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  href={item.to}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-6 py-3.5 font-display text-base transition-colors hover:bg-border-light",
                    isActive && "bg-border-light font-medium"
                  )}
                >
                  <item.icon width={20} height={20} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* User card */}
        <div className="mt-auto mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface px-2 py-3">
          <div className="flex items-start gap-2">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                JL
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-display text-base font-bold leading-6 text-heading">
                James Lucy
              </span>
              <span className="text-sm leading-5 text-muted-foreground">
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
  );
}
