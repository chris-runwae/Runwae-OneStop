"use client";
import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Check, Copy, AtSign, UserPlus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function ShareClient({ trip }: { trip: Doc<"trips"> }) {
  const [search, setSearch] = useState("");
  const results = useQuery(
    api.users.searchByUsername,
    search.trim().length >= 2 ? { term: search } : "skip",
  );
  const recents = useQuery(api.social.recentFriends, { limit: 5 });
  const inviteToTrip = useMutation(api.trips.inviteToTrip);

  // Track in-flight + already-invited state per user so the UI can swap
  // between "Invite", "Sending…", and "Invited ✓".
  const [pendingId, setPendingId] = useState<Id<"users"> | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function invite(userId: Id<"users">) {
    setError(null);
    setPendingId(userId);
    try {
      await inviteToTrip({ tripId: trip._id, inviteeId: userId });
      setInvitedIds((prev) => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send invite.");
    } finally {
      setPendingId(null);
    }
  }

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
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Invite friends
        </h3>

        {error && (
          <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Recent / scored friends — pre-loaded so users don't have to type
            to invite the people they're most likely to add. */}
        {recents && recents.length > 0 && search.trim().length === 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recent
            </div>
            <InviteList
              users={recents.map((r) => ({
                _id: r._id,
                name: r.name,
                username: r.username,
                image: r.image,
              }))}
              invitedIds={invitedIds}
              pendingId={pendingId}
              onInvite={invite}
            />
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
          <AtSign className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
            placeholder="Search any user by username"
            spellCheck={false}
            autoComplete="off"
            className="h-10 flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
        {search.trim().length >= 2 && results !== undefined && (
          <ul className="mt-3 space-y-2">
            {results.length === 0 ? (
              <li className="px-3 py-2 text-center text-xs text-muted-foreground">
                No matches.
              </li>
            ) : (
              <InviteList
                users={results.map((u) => ({
                  _id: u._id,
                  name: u.name ?? null,
                  username: u.username ?? null,
                  image: u.image ?? null,
                }))}
                invitedIds={invitedIds}
                pendingId={pendingId}
                onInvite={invite}
              />
            )}
          </ul>
        )}
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

function InviteList({
  users,
  invitedIds,
  pendingId,
  onInvite,
}: {
  users: Array<{
    _id: Id<"users">;
    name?: string | null;
    username?: string | null;
    image?: string | null;
  }>;
  invitedIds: Set<string>;
  pendingId: Id<"users"> | null;
  onInvite: (id: Id<"users">) => void;
}) {
  return (
    <ul className="space-y-2">
      {users.map((u) => {
        const invited = invitedIds.has(u._id);
        const busy = pendingId === u._id;
        return (
          <li
            key={u._id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                src={u.image ?? null}
                name={u.name ?? undefined}
                size="sm"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {u.name ?? "Member"}
                </div>
                {u.username && (
                  <div className="truncate text-xs text-muted-foreground">
                    @{u.username}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onInvite(u._id)}
              disabled={busy || invited}
              className={
                "inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-[12px] font-semibold transition-colors disabled:opacity-60 " +
                (invited
                  ? "bg-emerald-500/15 text-emerald-700"
                  : "bg-primary text-primary-foreground hover:bg-primary/90")
              }
            >
              {invited ? (
                <>
                  <Check className="h-3 w-3" /> Invited
                </>
              ) : busy ? (
                "Sending…"
              ) : (
                <>
                  <UserPlus className="h-3 w-3" /> Invite
                </>
              )}
            </button>
          </li>
        );
      })}
    </ul>
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
