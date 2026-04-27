"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityRow } from "@/components/home/HomePageClient";
import { FindFriendsSheet } from "@/components/social/FindFriendsSheet";

export default function FeedPage() {
  const list = useQuery(api.social.getFriendActivityHydrated, { limit: 50 });
  const [findOpen, setFindOpen] = useState(false);

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
