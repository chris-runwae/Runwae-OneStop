"use client";
import { useQuery } from "convex/react";
import type { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  trip: Doc<"trips">;
  displayCurrency?: string;
};

export function MembersBudget({ trip, displayCurrency }: Props) {
  const members = useQuery(api.members.listByTrip, { tripId: trip._id });

  return (
    <section className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
      <div className="flex items-center gap-3">
        {members === undefined ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <>
            <div className="flex">
              {members.slice(0, 4).map((m, i) => (
                <div
                  key={m._id}
                  title={m.user?.name ?? ""}
                  className="-ml-2 h-8 w-8 overflow-hidden rounded-full border-2 border-background bg-foreground/10 first:ml-0"
                  style={{ zIndex: 4 - i }}
                >
                  {m.user?.image && <img src={m.user.image} alt="" className="h-full w-full object-cover" />}
                </div>
              ))}
              {members.length > 4 && (
                <div className="-ml-2 grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-foreground/10 text-[11px] font-semibold">
                  +{members.length - 4}
                </div>
              )}
            </div>
            <span className="text-xs text-foreground/60">
              <b className="font-semibold text-foreground">{members.length}</b> traveler{members.length === 1 ? "" : "s"}
            </span>
          </>
        )}
      </div>

      {trip.estimatedBudget !== undefined && (
        <div className="text-xs text-foreground/60 md:text-right">
          <span className="font-semibold text-foreground">
            {formatCurrency(trip.estimatedBudget, trip.currency, displayCurrency)}
          </span>
          {" "}estimated
        </div>
      )}
    </section>
  );
}
