import type { Doc } from "@/convex/_generated/dataModel";

export type SavedItemType = Doc<"saved_items">["type"];

export type UiCategory = {
  id: "fly" | "stay" | "eat" | "tour" | "ride" | "event" | "shop" | "adventure" | "other";
  label: string;
  emoji: string;
  color: string;
};

const MAP: Record<SavedItemType, UiCategory> = {
  flight:     { id: "fly",       label: "Fly",        emoji: "✈️", color: "#2196F3" },
  hotel:      { id: "stay",      label: "Stay",       emoji: "🏨", color: "#7B68EE" },
  restaurant: { id: "eat",       label: "Eat/Drink",  emoji: "🍽",  color: "#F5A623" },
  tour:       { id: "tour",      label: "Tour",       emoji: "🧭", color: "#2196F3" },
  car_rental: { id: "ride",      label: "Ride",       emoji: "🚗", color: "#FF8C42" },
  event:      { id: "event",     label: "Event",      emoji: "🎟",  color: "#FF6B6B" },
  activity:   { id: "adventure", label: "Adventure",  emoji: "⛰",  color: "#8BC34A" },
  transport:  { id: "ride",      label: "Ride",       emoji: "🚇", color: "#FF8C42" },
  other:      { id: "other",     label: "Other",      emoji: "📍", color: "#6B6B6B" },
};

export function categoryFromType(t: SavedItemType): UiCategory {
  return MAP[t] ?? MAP.other;
}

// `shop` is a UI-only chip filter — not in the schema enum, so categoryFromType never returns it.
const SHOP: UiCategory = { id: "shop", label: "Shop", emoji: "🛍", color: "#E91E8C" };

export const ALL_CATEGORIES: UiCategory[] = [
  ...Array.from(new Map(Object.values(MAP).map(c => [c.id, c])).values()),
  SHOP,
];
