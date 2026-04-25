"use client";
import Link from "next/link";
import { Plane, CalendarPlus, UserPlus } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";

export function CreateSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = [
    { href: "/trips/new",      label: "New trip",   sub: "Plan a new adventure", Icon: Plane },
    { href: "/events/new",     label: "New event",  sub: "Host a meetup or trip", Icon: CalendarPlus },
    { href: "/profile/friends", label: "Find friends", sub: "Search people on Runwae", Icon: UserPlus },
  ];
  return (
    <Sheet open={open} onClose={onClose} title="Create">
      <div className="space-y-2">
        {items.map(({ href, label, sub, Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">{label}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </Sheet>
  );
}
