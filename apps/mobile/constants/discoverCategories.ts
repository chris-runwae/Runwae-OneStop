// Mirror of apps/web/components/discover/DiscoverGrid.tsx so both surfaces
// reference one taxonomy. When this drifts: update the web file first,
// then sync. Future home for this file: packages/ui (see
// docs/mobile-discover-plan.md Phase 4).

export const DISCOVER_CATEGORIES = [
  { k: "all", label: "All", emoji: "✨" },
  { k: "fly", label: "Fly", emoji: "✈️" },
  { k: "stay", label: "Stay", emoji: "🏨" },
  { k: "do", label: "Do", emoji: "🎯" },
  { k: "explore", label: "Explore", emoji: "🧭" },
  { k: "adv", label: "Adventure", emoji: "⛰" },
  { k: "eat", label: "Eat/Drink", emoji: "🍽" },
  { k: "attend", label: "Attend", emoji: "🎟" },
  { k: "shop", label: "Shop", emoji: "🛍" },
  { k: "relax", label: "Relax", emoji: "🌊" },
] as const;

export type DiscoverCategoryKey =
  (typeof DISCOVER_CATEGORIES)[number]["k"];

export const CHIP_QUERY: Record<
  string,
  { providerCategory: string; termSuffix?: string }
> = {
  fly: { providerCategory: "fly" },
  do: { providerCategory: "tour" },
  explore: { providerCategory: "tour" },
  adv: { providerCategory: "adventure" },
  eat: { providerCategory: "eat" },
  stay: { providerCategory: "stay" },
  attend: { providerCategory: "event" },
  shop: { providerCategory: "tour", termSuffix: " shopping" },
  relax: { providerCategory: "tour", termSuffix: " spa" },
};

export const DISCOVER_SAMPLES = [
  {
    id: "d1",
    cat: "eat",
    catLabel: "Eat/Drink",
    catEmoji: "🍽",
    title: "Tresind Studio",
    desc: "Theatrical 14-course Indian tasting menu in DIFC.",
    loc: "Dubai, UAE",
    img: "https://picsum.photos/seed/tresind-runwae/600/450",
  },
  {
    id: "d2",
    cat: "stay",
    catLabel: "Stay",
    catEmoji: "🏨",
    title: "Bvlgari Resort",
    desc: "Private island, Mediterranean elegance, infinity pool.",
    loc: "Jumeira Bay",
    img: "https://picsum.photos/seed/bvlgari-runwae/600/450",
  },
  {
    id: "d3",
    cat: "do",
    catLabel: "Do",
    catEmoji: "🎯",
    title: "Aura Skypool",
    desc: "Infinity glass pool 50 floors above Palm Jumeirah.",
    loc: "Palm Jumeirah",
    img: "https://picsum.photos/seed/aurapool-runwae/600/450",
  },
  {
    id: "d4",
    cat: "explore",
    catLabel: "Explore",
    catEmoji: "🧭",
    title: "Hatta Mountains",
    desc: "Kayak the dam, hike the wadis, swim turquoise water.",
    loc: "Hatta, UAE",
    img: "https://picsum.photos/seed/hatta-runwae/600/450",
  },
] as const;

export function defaultSearchDates(): { checkin: string; checkout: string } {
  const now = new Date();
  const out = new Date(now.getTime() + 14 * 86_400_000);
  const back = new Date(now.getTime() + 21 * 86_400_000);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
      2,
      "0",
    )}-${String(d.getUTCDate()).padStart(2, "0")}`;
  return { checkin: fmt(out), checkout: fmt(back) };
}

export type DiscoverItem = {
  provider: string;
  apiRef: string;
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  rating?: number;
  externalUrl?: string;
  locationName?: string;
  coords?: { lat: number; lng: number };
};
