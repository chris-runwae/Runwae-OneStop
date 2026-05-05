"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Search, UserPlus, Check } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function FindFriendsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [term, setTerm] = useState("");
  const viewer = useQuery(api.users.getCurrentUser, {});
  const matches = useQuery(
    api.users.searchByUsername,
    term.trim().length >= 2 ? { term } : "skip"
  );
  const sendRequest = useMutation(api.social.sendFriendRequest);
  const [sentTo, setSentTo] = useState<Record<string, "pending" | "sent" | "error">>(
    {}
  );

  // searchByUsername already drops `me`, but defend in depth so we never
  // surface the viewer's own row even if the query result is stale.
  const filtered = matches?.filter((u) => u._id !== viewer?._id) ?? matches;

  async function handleAdd(userId: Id<"users">) {
    const key = userId as unknown as string;
    setSentTo((s) => ({ ...s, [key]: "pending" }));
    try {
      await sendRequest({ addresseeId: userId });
      setSentTo((s) => ({ ...s, [key]: "sent" }));
    } catch {
      setSentTo((s) => ({ ...s, [key]: "error" }));
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Find friends"
      description="Search by username — case-insensitive, minimum 2 characters."
    >
      <label className="mb-4 flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="@username"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="max-h-[60vh] overflow-y-auto">
        {term.trim().length < 2 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted-foreground">
            Type a username to search.
          </div>
        ) : filtered === undefined ? (
          <>
            <Skeleton className="my-2 h-12" />
            <Skeleton className="my-2 h-12" />
          </>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted-foreground">
            No usernames matched <b>{term}</b>.
          </div>
        ) : (
          <ul className="space-y-1">
            {filtered.map((u) => {
              const key = u._id as unknown as string;
              const state = sentTo[key];
              return (
                <li
                  key={key}
                  className="flex items-center gap-3 rounded-xl px-2 py-2"
                >
                  <Avatar src={u.image} name={u.name ?? u.username ?? "?"} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {u.name ?? u.username}
                    </div>
                    {u.username && (
                      <div className="truncate text-xs text-muted-foreground">
                        @{u.username}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={state === "pending" || state === "sent"}
                    onClick={() => handleAdd(u._id)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    {state === "sent" ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Requested
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" /> Add friend
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
