"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function PollsView({ trip }: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  const polls = useQuery(api.polls.getByTrip, { tripId: trip._id });
  const vote  = useMutation(api.polls.vote);
  const create = useMutation(api.polls.create);
  const [creating, setCreating] = useState(false);

  if (polls === undefined) {
    return <div className="space-y-3"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;
  }

  return (
    <div className="space-y-3">
      {polls.length === 0 && (
        <div className="rounded-2xl border border-dashed border-foreground/15 px-6 py-10 text-center text-sm text-foreground/60">
          No polls yet — start a vote.
        </div>
      )}
      {polls.map(p => (
        <article key={p._id} className="rounded-2xl border border-foreground/10 bg-background p-4 shadow-sm">
          <header className="mb-3 flex items-center gap-3">
            {p.author?.image && <img src={p.author.image} alt="" className="h-9 w-9 rounded-full object-cover" />}
            <div>
              <div className="text-sm font-semibold">{p.author?.name ?? "Someone"}</div>
              <div className="text-[11px] text-foreground/60">{new Date(p.createdAt).toLocaleDateString()}</div>
            </div>
          </header>
          <div className="font-display text-base font-semibold">{p.title}</div>
          <div className="mt-3 space-y-2">
            {p.options.map(o => {
              const pct = p.totalVotes ? Math.round((o.voteCount / p.totalVotes) * 100) : 0;
              return (
                <button key={o._id} onClick={() => vote({ pollId: p._id, optionId: o._id })}
                  className="relative flex h-10 w-full items-center overflow-hidden rounded-full bg-foreground/5">
                  <div className="absolute inset-y-0 left-0 bg-primary/20" style={{ width: `${pct}%` }} />
                  <span className="relative px-3 text-xs font-semibold">{o.label}</span>
                  <span className="relative ml-auto pr-3 text-xs font-bold">{pct}%</span>
                </button>
              );
            })}
          </div>
        </article>
      ))}
      <button
        disabled={creating}
        onClick={async () => {
          setCreating(true);
          try {
            const title = window.prompt("Poll question?");
            if (title) {
              const optionsRaw = window.prompt("Options (comma-separated)") ?? "";
              const opts = optionsRaw.split(",").map(s => s.trim()).filter(Boolean);
              if (opts.length >= 2) {
                await create({ tripId: trip._id, title, type: "single_choice", options: opts });
              }
            }
          } finally {
            setCreating(false);
          }
        }}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary text-sm font-semibold text-primary",
          creating && "opacity-60",
        )}
      >
        <Plus className="h-4 w-4" /> Create poll
      </button>
    </div>
  );
}
