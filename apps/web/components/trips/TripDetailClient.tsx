"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import type { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
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
  const [tab, setTab] = useState<TabId>("itinerary");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <TripHero trip={trip} timezone={"UTC"} />
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
