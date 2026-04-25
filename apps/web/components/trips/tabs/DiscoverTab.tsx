"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { ALL_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function DiscoverTab({ trip }: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  const [active, setActive] = useState<string>("all");
  const term = trip.destinationLabel ?? "";
  const results = useQuery(
    api.search.searchAll,
    term.trim().length >= 2 ? { term, limit: 12 } : "skip",
  );

  const experiences = results?.experiences ?? [];
  const events      = results?.events ?? [];

  if (!term) {
    return (
      <div className="rounded-2xl border border-dashed border-foreground/15 px-6 py-8 text-center text-sm text-foreground/60">
        Set a destination on this trip to see suggestions.
      </div>
    );
  }

  return (
    <>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        <Chip on={active === "all"} onClick={() => setActive("all")}>All</Chip>
        {ALL_CATEGORIES.map(c => (
          <Chip key={c.id} on={active === c.id} onClick={() => setActive(c.id)}>{c.emoji} {c.label}</Chip>
        ))}
      </div>

      <Section title="Suggested for you">
        {results === undefined ? <Skeleton className="h-44 w-full" /> : experiences.length === 0 ? (
          <p className="text-xs text-foreground/60">No experiences found for &ldquo;{term}&rdquo;.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {experiences.map(e => (
              <article key={e._id} className="w-52 flex-shrink-0 overflow-hidden rounded-xl border border-foreground/10 bg-background">
                {e.imageUrl && <img src={e.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />}
                <div className="p-3">
                  <div className="text-sm font-semibold">{e.title}</div>
                  {e.description && <div className="line-clamp-2 text-xs text-foreground/60">{e.description}</div>}
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section title="Top events">
        {results === undefined ? <Skeleton className="h-44 w-full" /> : events.length === 0 ? (
          <p className="text-xs text-foreground/60">No events found for &ldquo;{term}&rdquo;.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {events.map(e => (
              <article key={e._id} className="overflow-hidden rounded-xl border border-foreground/10 bg-background">
                {e.imageUrl && <img src={e.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />}
                <div className="p-3">
                  <div className="text-sm font-semibold">{e.name}</div>
                  {e.description && <div className="line-clamp-2 text-xs text-foreground/60">{e.description}</div>}
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

function Chip({ on, onClick, children }: React.PropsWithChildren<{ on: boolean; onClick: () => void }>) {
  return (
    <button onClick={onClick} className={cn(
      "h-9 flex-shrink-0 rounded-full px-4 text-xs font-medium",
      on ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground/70 hover:text-foreground",
    )}>{children}</button>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <section className="mt-5">
      <header className="mb-2 flex items-center justify-between"><h3 className="font-display text-lg font-bold">{title}</h3></header>
      {children}
    </section>
  );
}
