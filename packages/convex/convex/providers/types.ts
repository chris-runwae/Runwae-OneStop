export type DiscoveryItem = {
  provider: "viator" | "liteapi" | "static";
  apiRef: string;
  category: "stay" | "tour" | "adventure" | "event" | "eat" | "ride" | "fly" | "shop" | "other";
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  externalUrl?: string;
  locationName?: string;
  coords?: { lat: number; lng: number };
  rating?: number;
};
