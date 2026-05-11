// Mirror of providers/types.ts on the Convex side. Mobile imports stay decoupled
// from the Convex generated types so the shape can drift independently.

export type DiscoverProvider =
  | 'viator'
  | 'liteapi'
  | 'duffel'
  | 'rentalcars'
  | 'tiqets'
  | 'yelp'
  | 'ticketmaster'
  | 'geoapify'
  | 'static';

export type DiscoveryItem = {
  provider: DiscoverProvider;
  apiRef: string;
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  externalUrl?: string;
  locationName?: string;
  rating?: number;
};

export const PROVIDER_LABELS: Partial<Record<DiscoverProvider, string>> = {
  viator: 'Viator',
  tiqets: 'Tiqets',
  ticketmaster: 'Ticketmaster',
  yelp: 'Yelp',
  geoapify: 'Geoapify',
};

// Viator standard catalog tag IDs. Used to bucket products into UI sections
// without firing extra calls or filtering client-side.
export const VIATOR_TAGS = {
  SIGHTSEEING: 11930,
  ADVENTURE: 21972,
} as const;
