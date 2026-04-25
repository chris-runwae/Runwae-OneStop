"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { Check, Copy, AtSign } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function ShareClient({ trip }: { trip: Doc<"trips"> }) {
  const [search, setSearch] = useState("");
  const results = useQuery(
    api.users.searchByUsername,
    search.trim().length >= 2 ? { term: search } : "skip",
  );

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/t/${trip.slug}` : `/t/${trip.slug}`;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Your trip is live</h1>
        <p className="text-sm text-muted-foreground">Invite friends or share the link to start planning together.</p>
      </header>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {trip.coverImageUrl && (
          <img src={trip.coverImageUrl} alt="" className="h-40 w-full object-cover" />
        )}
        <div className="p-4">
          <h2 className="font-display text-xl font-bold text-foreground">{trip.title}</h2>
          {trip.destinationLabel && (
            <p className="text-sm text-muted-foreground">{trip.destinationLabel}</p>
          )}
        </div>
      </section>

      <section className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Join code</h3>
        <CopyRow value={trip.joinCode} display={trip.joinCode} mono />
        <h3 className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Share link</h3>
        <CopyRow value={shareUrl} display={shareUrl} />
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invite friends</h3>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
          <AtSign className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
            placeholder="Search by username"
            spellCheck={false}
            autoComplete="off"
            className="h-10 flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
        {search.trim().length >= 2 && results !== undefined && (
          <ul className="mt-3 space-y-2">
            {results.length === 0 ? (
              <li className="px-3 py-2 text-center text-xs text-muted-foreground">No matches.</li>
            ) : (
              results.map((u) => (
                <li
                  key={u._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar src={u.image ?? null} name={u.name ?? undefined} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{u.name ?? "Member"}</div>
                      {u.username && (
                        <div className="truncate text-xs text-muted-foreground">@{u.username}</div>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">Invite — coming soon</span>
                </li>
              ))
            )}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          For now, copy the join code or share link above and send it to your group.
        </p>
      </section>

      <Link
        href={`/trips/${trip.slug}`}
        className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Go to trip
      </Link>
    </main>
  );
}

function CopyRow({ value, display, mono }: { value: string; display: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore — older browsers without clipboard API
    }
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-3">
      <span className={`min-w-0 flex-1 truncate text-sm ${mono ? "font-mono tracking-wider" : ""}`}>
        {display}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={copy}
        className="shrink-0"
      >
        {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
      </Button>
    </div>
  );
}
