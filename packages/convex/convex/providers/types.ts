export type DiscoveryItem = {
  provider:
    | "viator"
    | "liteapi"
    | "duffel"
    | "rentalcars"
    | "tiqets"
    | "yelp"
    | "ticketmaster"
    | "geoapify"
    | "static";
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

export type DiscoveryDetail = DiscoveryItem & {
  gallery?: string[];
  highlights?: string[];
  amenities?: string[];
  duration?: string;
  address?: string;
  reviewCount?: number;
};
