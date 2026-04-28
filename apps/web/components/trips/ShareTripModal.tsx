"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Copy, Link2, Search, UserPlus, Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SearchResult = {
  _id: Id<"users">;
  name?: string;
  image?: string;
  username?: string;
};

interface ShareTripModalProps {
  open: boolean;
  onClose: () => void;
  trip: Doc<"trips">;
}

export function ShareTripModal({ open, onClose, trip }: ShareTripModalProps) {
  const [tab, setTab] = useState<"user" | "link">("user");
  const [term, setTerm] = useState("");
  const [pendingId, setPendingId] = useState<Id<"users"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [linkCopied, setLinkCopied] = useState(false);

  const inviteToTrip = useMutation(api.trips.inviteToTrip);
  const results = useQuery(
    api.users.searchByUsername,
    term.trim().length >= 2 ? { term: term.trim() } : "skip"
  ) as SearchResult[] | undefined;

  // Reset on close.
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setTerm("");
        setError(null);
        setInvitedIds(new Set());
        setPendingId(null);
        setLinkCopied(false);
      }, 200);
    }
  }, [open]);

  const shareLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/trips/${trip.slug}`;
  }, [trip.slug]);

  async function handleInvite(userId: Id<"users">) {
    setPendingId(userId);
    setError(null);
    try {
      await inviteToTrip({ tripId: trip._id, inviteeId: userId });
      setInvitedIds((prev) => new Set(prev).add(userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send invite.");
    } finally {
      setPendingId(null);
    }
  }

  async function copyLink() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setError("Couldn't copy to clipboard.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Share trip" description={trip.title}>
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("user")}
          className={cn(
            "h-9 flex-1 rounded-full text-xs font-semibold",
            tab === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-foreground/5 text-foreground/70"
          )}
        >
          <Users className="mr-1 inline h-3.5 w-3.5" /> Invite friend
        </button>
        <button
          type="button"
          onClick={() => setTab("link")}
          className={cn(
            "h-9 flex-1 rounded-full text-xs font-semibold",
            tab === "link"
              ? "bg-primary text-primary-foreground"
              : "bg-foreground/5 text-foreground/70"
          )}
        >
          <Link2 className="mr-1 inline h-3.5 w-3.5" /> Copy link
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {tab === "user" ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search by username…"
              className="h-10 w-full rounded-full bg-foreground/5 pl-9 pr-3 text-sm focus:bg-foreground/10 focus:outline-none"
            />
          </div>
          <ul className="mt-3 max-h-[40vh] space-y-1 overflow-y-auto">
            {term.trim().length < 2 ? (
              <li className="px-3 py-6 text-center text-xs text-muted-foreground">
                Start typing a username to find friends.
              </li>
            ) : results === undefined ? (
              <>
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </>
            ) : results.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-muted-foreground">
                No users matched “{term}”.
              </li>
            ) : (
              results.map((u) => {
                const invited = invitedIds.has(u._id);
                const busy = pendingId === u._id;
                return (
                  <li key={u._id}>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                      <Avatar src={u.image} name={u.name ?? undefined} size="md" />
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
                      <button
                        type="button"
                        onClick={() => handleInvite(u._id)}
                        disabled={busy || invited}
                        className={cn(
                          "inline-flex h-8 items-center gap-1 rounded-full px-3 text-[12px] font-semibold transition-colors disabled:opacity-60",
                          invited
                            ? "bg-emerald-500/15 text-emerald-700"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
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
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
            <input
              readOnly
              value={shareLink}
              className="flex-1 truncate bg-transparent text-xs text-foreground/80 focus:outline-none"
            />
            <button
              type="button"
              onClick={copyLink}
              className={cn(
                "inline-flex h-8 items-center gap-1 rounded-full px-3 text-[12px] font-semibold transition-colors",
                linkCopied
                  ? "bg-emerald-500/15 text-emerald-700"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {linkCopied ? (
                <>
                  <Check className="h-3 w-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy
                </>
              )}
            </button>
          </div>
          <p className="text-[11.5px] text-muted-foreground">
            Anyone with the link can view this trip.
            {trip.visibility !== "public" &&
              " They'll be prompted to request to join."}
          </p>
        </div>
      )}
    </Modal>
  );
}
