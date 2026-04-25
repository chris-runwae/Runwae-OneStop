import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { DiscoveryItem } from "./types";

const SAMPLES: Record<string, DiscoveryItem[]> = {
  stay: [
    { provider: "static", apiRef: "stay-1", category: "stay", title: "Boutique loft downtown", description: "Stylish 1-bed steps from the centre.", imageUrl: "https://picsum.photos/seed/stay-1/600/450", price: 180, currency: "GBP", rating: 4.6 },
    { provider: "static", apiRef: "stay-2", category: "stay", title: "Riverside guesthouse", description: "Quiet stay with breakfast included.", imageUrl: "https://picsum.photos/seed/stay-2/600/450", price: 95, currency: "GBP", rating: 4.4 },
    { provider: "static", apiRef: "stay-3", category: "stay", title: "Park-view hotel suite", description: "Modern suite, gym + spa.", imageUrl: "https://picsum.photos/seed/stay-3/600/450", price: 240, currency: "GBP", rating: 4.7 },
  ],
  tour: [
    { provider: "static", apiRef: "tour-1", category: "tour", title: "Old town walking tour", description: "2-hour history walk with a local guide.", imageUrl: "https://picsum.photos/seed/tour-1/600/450", price: 25, currency: "GBP", rating: 4.8 },
    { provider: "static", apiRef: "tour-2", category: "tour", title: "Sunset food crawl", description: "5 stops, local bites & a drink.", imageUrl: "https://picsum.photos/seed/tour-2/600/450", price: 60, currency: "GBP", rating: 4.9 },
    { provider: "static", apiRef: "tour-3", category: "tour", title: "Photography small-group tour", description: "Best vantage points + tips.", imageUrl: "https://picsum.photos/seed/tour-3/600/450", price: 75, currency: "GBP", rating: 4.7 },
  ],
  adventure: [
    { provider: "static", apiRef: "adv-1", category: "adventure", title: "Coastal kayak experience", description: "Half-day paddle with a guide.", imageUrl: "https://picsum.photos/seed/adv-1/600/450", price: 90, currency: "GBP", rating: 4.7 },
    { provider: "static", apiRef: "adv-2", category: "adventure", title: "Mountain bike singletrack", description: "Bikes provided. Intermediate level.", imageUrl: "https://picsum.photos/seed/adv-2/600/450", price: 120, currency: "GBP", rating: 4.8 },
  ],
  event: [
    { provider: "static", apiRef: "evt-1", category: "event", title: "Open-air jazz night", description: "Friday at the harbour amphitheatre.", imageUrl: "https://picsum.photos/seed/evt-1/600/450", price: 35, currency: "GBP", rating: 4.5 },
    { provider: "static", apiRef: "evt-2", category: "event", title: "Street food festival", description: "Saturday — 30+ vendors.", imageUrl: "https://picsum.photos/seed/evt-2/600/450", price: 0, currency: "GBP", rating: 4.6 },
  ],
  eat: [
    { provider: "static", apiRef: "eat-1", category: "eat", title: "Tasting menu — Asari", description: "Modern Japanese, 8 courses.", imageUrl: "https://picsum.photos/seed/eat-1/600/450", price: 95, currency: "GBP", rating: 4.8 },
    { provider: "static", apiRef: "eat-2", category: "eat", title: "Trattoria del Vico", description: "Family-run pasta, walk-ins welcome.", imageUrl: "https://picsum.photos/seed/eat-2/600/450", price: 35, currency: "GBP", rating: 4.7 },
    { provider: "static", apiRef: "eat-3", category: "eat", title: "The Roof Bar", description: "Cocktails, sunset over the rooftops.", imageUrl: "https://picsum.photos/seed/eat-3/600/450", price: 18, currency: "GBP", rating: 4.5 },
  ],
  ride: [
    { provider: "static", apiRef: "ride-1", category: "ride", title: "Compact car rental, 3 days", description: "Auto, AC, unlimited miles.", imageUrl: "https://picsum.photos/seed/ride-1/600/450", price: 110, currency: "GBP", rating: 4.4 },
    { provider: "static", apiRef: "ride-2", category: "ride", title: "Airport transfer (sedan)", description: "Door-to-door, fixed price.", imageUrl: "https://picsum.photos/seed/ride-2/600/450", price: 45, currency: "GBP", rating: 4.6 },
  ],
};

export const search = internalAction({
  args: {
    category: v.string(),
    term: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    limit: v.number(),
  },
  // Coords ignored — this fallback returns curated samples keyed only by category.
  handler: async (_ctx, { category, term, limit }) => {
    const arr = SAMPLES[category] ?? [];
    const needle = term.trim().toLowerCase();
    const filtered = needle
      ? arr.filter(i => i.title.toLowerCase().includes(needle) || (i.description ?? "").toLowerCase().includes(needle))
      : arr;
    return filtered.slice(0, limit);
  },
});
