"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";

export function MembersView({ trip }: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  const members = useQuery(api.members.listByTrip, { tripId: trip._id });
  if (members === undefined) {
    return <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>;
  }
  if (members.length === 0) {
    return <div className="py-8 text-center text-sm text-foreground/60">No accepted members yet.</div>;
  }
  return (
    <ul className="divide-y divide-foreground/10">
      {members.map(m => (
        <li key={m._id} className="flex items-center gap-3 py-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-foreground/10">
            {m.user?.image && <img src={m.user.image} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{m.user?.name ?? "Member"}</div>
            <div className="text-[11px] text-foreground/60">{m.role}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
