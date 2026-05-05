"use client";
import { useState } from "react";
import Link from "next/link";
import { Plane, CalendarPlus, UserPlus } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { CreateTripModal } from "@/components/trips/CreateTripModal";

// Bottom-sheet shown when the sidebar/mobile FAB Create is tapped. "New trip"
// now opens the new modal-style flow inline; the other entries stay as
// plain links.
export function CreateSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tripModalOpen, setTripModalOpen] = useState(false);

  return (
    <>
      <Sheet open={open && !tripModalOpen} onClose={onClose} title="Create">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setTripModalOpen(true);
            }}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-muted"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
              <Plane className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">
                New trip
              </div>
              <div className="text-xs text-muted-foreground">
                Plan a new adventure
              </div>
            </div>
          </button>
          {[
            {
              href: "/events/new",
              label: "New event",
              sub: "Host a meetup or trip",
              Icon: CalendarPlus,
            },
            {
              href: "/profile/friends",
              label: "Find friends",
              sub: "Search people on Runwae",
              Icon: UserPlus,
            },
          ].map(({ href, label, sub, Icon }) => (
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
                <div className="text-sm font-semibold text-foreground">
                  {label}
                </div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </Sheet>

      <CreateTripModal
        open={tripModalOpen}
        onClose={() => {
          setTripModalOpen(false);
          onClose();
        }}
      />
    </>
  );
}
