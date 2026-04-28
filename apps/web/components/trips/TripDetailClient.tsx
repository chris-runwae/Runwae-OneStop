"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { TripHero } from "./TripHero";
import { MembersBudget } from "./MembersBudget";
import { ItineraryTab } from "./tabs/ItineraryTab";
import { DiscoverTab } from "./tabs/DiscoverTab";
import { SavedTab } from "./tabs/SavedTab";
import { ActivityTab } from "./tabs/ActivityTab";

type TabId = "itinerary" | "discover" | "saved" | "activity";
const TABS: { id: TabId; label: string }[] = [
  { id: "itinerary", label: "Itinerary" },
  { id: "discover",  label: "Discover" },
  { id: "saved",     label: "Saved" },
  { id: "activity",  label: "Activity" },
];

export function TripDetailClient({ slug, initialTrip }: {
  slug: string;
  initialTrip: Doc<"trips">;
}) {
  const liveTrip = useQuery(api.trips.getBySlug, { slug });
  const trip = liveTrip ?? initialTrip;
  const viewer = useQuery(api.users.getCurrentUser, {});
  const membership = useQuery(api.trips.getViewerMembership, { tripId: trip._id });
  const respondToInvite = useMutation(api.trips.respondToInvite);
  const [tab, setTab] = useState<TabId>("itinerary");
  const [respondBusy, setRespondBusy] = useState(false);

  const isPending = membership?.status === "pending";

  async function handleRespond(accept: boolean) {
    setRespondBusy(true);
    try {
      await respondToInvite({ tripId: trip._id, accept });
    } finally {
      setRespondBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <TripHero trip={trip} timezone={"UTC"} />
      {isPending && (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-primary/30 bg-primary/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <span className="font-semibold text-foreground">
              You&apos;ve been invited to this trip.
            </span>
            <span className="ml-1 text-muted-foreground">
              Accept to start collaborating.
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleRespond(true)}
              disabled={respondBusy}
              className="inline-flex h-9 items-center gap-1 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" /> Accept
            </button>
            <button
              type="button"
              onClick={() => handleRespond(false)}
              disabled={respondBusy}
              className="inline-flex h-9 items-center gap-1 rounded-full bg-foreground/5 px-4 text-xs font-semibold text-foreground disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" /> Decline
            </button>
          </div>
        </div>
      )}
      <MembersBudget trip={trip} displayCurrency={viewer?.preferredCurrency} />

      <nav className="mt-6 flex gap-2 border-b border-foreground/10" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-3 py-3 text-xs font-semibold uppercase tracking-wider",
              "border-b-2 -mb-px transition-colors",
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-foreground/40 hover:text-foreground/70",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-4">
        {tab === "itinerary" && <ItineraryTab trip={trip} viewer={viewer ?? null} />}
        {tab === "discover"  && <DiscoverTab  trip={trip} viewer={viewer ?? null} />}
        {tab === "saved"     && <SavedTab     trip={trip} viewer={viewer ?? null} />}
        {tab === "activity"  && <ActivityTab  trip={trip} viewer={viewer ?? null} />}
      </div>
    </main>
  );
}
