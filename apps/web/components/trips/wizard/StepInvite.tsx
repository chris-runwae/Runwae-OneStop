"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { Check, Search, UserPlus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Pickable = {
  _id: Id<"users">;
  name?: string | null;
  username?: string | null;
  image?: string | null;
};

interface StepInviteProps {
  selectedIds: Id<"users">[];
  onChange: (next: Id<"users">[]) => void;
  onNext: () => void;
  onBack: () => void;
}

// Wizard step 3: optional invite of friends to the trip. Pre-loads up to 5
// scored "recent" friends from `social.recentFriends`; falls back to a
// search-by-username box. Selections are deferred — the actual
// `trips.inviteToTrip` calls happen after the trip is created so we have
// the tripId.
export function StepInvite({
  selectedIds,
  onChange,
  onNext,
  onBack,
}: StepInviteProps) {
  const recent = useQuery(api.social.recentFriends, { limit: 5 });
  const [term, setTerm] = useState("");
  const search = useQuery(
    api.users.searchByUsername,
    term.trim().length >= 2 ? { term: term.trim() } : "skip"
  ) as Pickable[] | undefined;

  const selectedSet = new Set(selectedIds);

  function toggle(id: Id<"users">) {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  // Combine recent (pre-loaded) + search results, dedup by id, recent first.
  const combined: Pickable[] = [];
  const seen = new Set<string>();
  for (const r of recent ?? []) {
    seen.add(r._id);
    combined.push(r);
  }
  for (const s of search ?? []) {
    if (seen.has(s._id)) continue;
    seen.add(s._id);
    combined.push(s);
  }

  // Also keep currently-selected users visible even if no longer in
  // recent/search lists, so deselect always works.
  useEffect(() => {
    /* selectedIds is the source of truth — nothing to sync here */
  }, []);

  return (
    <div className="space-y-4">
      <header className="space-y-1 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Invite anyone?
        </h2>
        <p className="text-sm text-muted-foreground">
          They&apos;ll get a notification with accept/decline. You can always
          invite more later.
        </p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search by username…"
          className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {selectedIds.length > 0 && (
        <p className="text-[12px] font-semibold text-primary">
          {selectedIds.length} selected
        </p>
      )}

      <div className="space-y-1">
        {recent === undefined ? (
          <>
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </>
        ) : combined.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
            {term.trim().length >= 2
              ? `No users matched “${term}”.`
              : "No friends yet. Add some on /feed first, or skip this step."}
          </div>
        ) : (
          <>
            {recent && recent.length > 0 && (
              <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recent
              </div>
            )}
            {combined.map((u) => {
              const on = selectedSet.has(u._id);
              return (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => toggle(u._id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                    on
                      ? "border-primary bg-primary/[0.06]"
                      : "border-border bg-card hover:bg-muted/40"
                  )}
                >
                  <Avatar
                    src={u.image ?? undefined}
                    name={u.name ?? undefined}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {u.name ?? "User"}
                    </div>
                    {u.username && (
                      <div className="truncate text-xs text-muted-foreground">
                        @{u.username}
                      </div>
                    )}
                  </div>
                  <span
                    aria-hidden
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-full transition-colors",
                      on
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/5 text-foreground/40"
                    )}
                  >
                    {on ? <Check className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onBack}
        >
          Back
        </Button>
        <Button type="button" size="lg" className="flex-1" onClick={onNext}>
          {selectedIds.length === 0 ? "Skip" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
