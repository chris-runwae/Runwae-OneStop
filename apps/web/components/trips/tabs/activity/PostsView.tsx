"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/format";

export function PostsView({ trip }: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  const posts = useQuery(api.posts.getByTrip, { tripId: trip._id });
  if (posts === undefined) return <Skeleton className="h-32" />;
  if (!posts.length) return <div className="py-8 text-center text-sm text-foreground/60">No posts yet.</div>;
  return (
    <div className="space-y-3">
      {posts.map(p => (
        <article key={p._id} className="rounded-2xl border border-foreground/10 bg-background p-4 shadow-sm">
          <header className="mb-2 flex items-center gap-3">
            {p.author?.image && <img src={p.author.image} alt="" className="h-8 w-8 rounded-full object-cover" />}
            <div>
              <div className="text-sm font-semibold">{p.author?.name}</div>
              <div className="text-[11px] text-foreground/60">{formatRelativeTime(p.createdAt)}</div>
            </div>
          </header>
          <p className="text-sm leading-relaxed">{p.content}</p>
          {p.imageUrls?.[0] && (
            <img src={p.imageUrls[0]} alt="" className="mt-3 aspect-[16/9] w-full rounded-xl object-cover" />
          )}
        </article>
      ))}
    </div>
  );
}
