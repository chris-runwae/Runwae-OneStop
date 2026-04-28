"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Users, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { ActivityRow } from "@/components/home/HomePageClient";
import { FindFriendsSheet } from "@/components/social/FindFriendsSheet";

export default function FeedPage() {
  const list = useQuery(api.social.getFriendActivityHydrated, { limit: 50 });
  const pending = useQuery(api.social.listPendingFriendRequests, {});
  const respondToFriend = useMutation(api.social.respondToFriendRequest);
  const [findOpen, setFindOpen] = useState(false);
  const [busyId, setBusyId] = useState<Id<"friendships"> | null>(null);

  async function handleRespond(
    friendshipId: Id<"friendships">,
    accept: boolean
  ) {
    setBusyId(friendshipId);
    try {
      await respondToFriend({
        friendshipId,
        action: accept ? "accept" : "decline",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 lg:px-7">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Friends&apos; activity
          </h1>
          <p className="text-sm text-muted-foreground">
            Latest trips, RSVPs and saves from your friends.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFindOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-muted px-3 text-xs font-semibold text-foreground transition-colors hover:bg-foreground/10"
        >
          <Users className="h-3.5 w-3.5" /> Find friends
        </button>
      </header>

      {pending && pending.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Friend requests
          </h2>
          <ul className="space-y-2">
            {pending.map((p) => {
              const busy = busyId === p.friendshipId;
              return (
                <li
                  key={p.friendshipId}
                  className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/[0.05] px-3 py-3"
                >
                  <Avatar
                    src={p.requester.image ?? undefined}
                    name={p.requester.name ?? undefined}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {p.requester.name ?? "Someone"} wants to be friends
                    </div>
                    {p.requester.username && (
                      <div className="truncate text-xs text-muted-foreground">
                        @{p.requester.username}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleRespond(p.friendshipId, true)}
                      aria-label="Accept friend request"
                      className="inline-flex h-9 items-center gap-1 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      <Check className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleRespond(p.friendshipId, false)}
                      aria-label="Decline friend request"
                      className="inline-flex h-9 items-center gap-1 rounded-full bg-foreground/5 px-3 text-xs font-semibold text-foreground disabled:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" /> Decline
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {list === undefined ? (
        <div className="space-y-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <Users className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <h2 className="font-display text-base font-bold text-foreground">
            No activity yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add friends to see what they&apos;re planning.
          </p>
          <button
            type="button"
            onClick={() => setFindOpen(true)}
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Users className="h-4 w-4" /> Find friends
          </button>
        </div>
      ) : (
        <div>
          {list.map((a, i) => (
            <ActivityRow key={`${a.kind}-${i}`} item={a} isLast={i === list.length - 1} />
          ))}
        </div>
      )}

      <FindFriendsSheet open={findOpen} onClose={() => setFindOpen(false)} />
    </main>
  );
}
