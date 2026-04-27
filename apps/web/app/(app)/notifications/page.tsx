"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  Bell,
  CalendarPlus,
  CheckCheck,
  CreditCard,
  HeartHandshake,
  Map,
  TicketCheck,
  UserPlus2,
  Vote,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type NotificationType = Doc<"notifications">["type"];

const ICONS: Record<NotificationType, typeof Bell> = {
  trip_invite: Map,
  friend_request: UserPlus2,
  friend_accepted: HeartHandshake,
  friend_trip_created: Map,
  trip_item_saved: Map,
  poll_created: Vote,
  poll_closed: Vote,
  expense_added: CreditCard,
  expense_settled: CreditCard,
  payout_ready: CreditCard,
  booking_confirmed: TicketCheck,
  trip_cloned: Map,
  event_reminder: CalendarPlus,
  ticket_issued: TicketCheck,
};

const TITLES: Record<NotificationType, string> = {
  trip_invite: "Trip invitation",
  friend_request: "New friend request",
  friend_accepted: "Friend request accepted",
  friend_trip_created: "A friend started a trip",
  trip_item_saved: "Someone saved a place",
  poll_created: "New poll",
  poll_closed: "Poll closed",
  expense_added: "Expense added",
  expense_settled: "Expense settled",
  payout_ready: "Payout ready",
  booking_confirmed: "Booking confirmed",
  trip_cloned: "Trip cloned",
  event_reminder: "Event reminder",
  ticket_issued: "Ticket issued",
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const list = useQuery(api.notifications.list, { onlyUnread: filter === "unread" });
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 lg:px-7">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">Latest activity for your account.</p>
        </div>
        <button
          type="button"
          onClick={() => markAllRead({})}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-muted px-3 text-xs font-semibold text-foreground transition-colors hover:bg-foreground/10"
        >
          <CheckCheck className="h-3.5 w-3.5" /> Mark all read
        </button>
      </header>

      <div className="mb-4 flex gap-2">
        {(["all", "unread"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={cn(
              "h-8 rounded-full border px-3 text-xs font-semibold transition-colors",
              filter === k
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {k === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>

      {list === undefined ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <Bell className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <h2 className="font-display text-base font-bold text-foreground">
            You&apos;re all caught up
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            New activity will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {list.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            return (
              <li key={n._id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!n.isRead) markRead({ notificationId: n._id as Id<"notifications"> });
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                    n.isRead
                      ? "border-border bg-card hover:bg-muted/40"
                      : "border-primary/20 bg-primary/[0.04] hover:bg-primary/[0.07]"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                      n.isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {TITLES[n.type] ?? n.type}
                      </span>
                      {!n.isRead && (
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {formatRelativeTime(n.createdAt)}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
