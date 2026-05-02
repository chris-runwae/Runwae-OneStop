import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';

import {
  Destination,
  Event,
  Experience,
  ItineraryTemplate,
} from '@/types/content.types';

interface ExploreData {
  itineraries: ItineraryTemplate[];
  events: Event[];
  experiences: Experience[];
  destinations: Destination[];
}

interface UseExploreDataResult {
  data: ExploreData;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// ── Adapters: Convex shape → mobile content types ────────────────────────
// Mobile screens consume the legacy `Destination`/`Event`/`Experience`/
// `ItineraryTemplate` shapes from `@/types/content.types`. Mapping at the
// hook layer keeps screen code identical while the backend speaks the
// flat Convex schema.

function toDestination(d: any): Destination {
  return {
    id: d._id as unknown as string,
    title: d.name,
    location: [d.country, d.region].filter(Boolean).join(', '),
    image: d.heroImageUrl ?? '',
    country: d.country,
    rating: d.ratingAverage,
    reviewCount: d.ratingCount,
    description: d.description,
    featured: d.isFeatured,
    tags: d.tags,
  };
}

function isoDateOnly(ms: number | undefined): string {
  if (!ms) return '';
  return new Date(ms).toISOString().slice(0, 10);
}
function isoTime(ms: number | undefined): string {
  if (!ms) return '';
  const d = new Date(ms);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

function toEvent(e: any): Event {
  return {
    id: e._id as unknown as string,
    title: e.name,
    location: e.locationName,
    date: isoDateOnly(e.startDateUtc),
    time: isoTime(e.startDateUtc),
    category: e.category ?? 'event',
    image: e.imageUrl ?? e.imageUrls?.[0] ?? '',
    latitude: e.locationCoords?.lat ?? 0,
    longitude: e.locationCoords?.lng ?? 0,
    description: e.description,
    currentParticipants: e.currentParticipants,
    imageUrls: e.imageUrls,
    status: e.status,
    publishedAt: undefined,
  };
}

function toExperience(e: any): Experience {
  return {
    id: e._id as unknown as string,
    title: e.title,
    category: e.category ?? 'activity',
    rating: e.ratingAverage ?? 0,
    reviewCount: e.ratingCount ?? 0,
    description: e.description ?? '',
    image: e.heroImageUrl ?? e.imageUrls?.[0] ?? '',
    gallery: e.imageUrls ?? [],
    price: e.priceFrom ?? 0,
    currency: e.currency,
    featured: e.isFeatured,
    destinationId: e.destinationId as unknown as string,
    included: [],
    whatToKnow: [],
    itinerary: [],
    reviews: [],
    location: e.locationName,
    durationMinutes: e.durationMinutes,
  };
}

function toItineraryTemplate(t: any): ItineraryTemplate {
  return {
    id: t._id as unknown as string,
    title: t.title,
    location: '',
    duration: `${t.durationDays} day${t.durationDays === 1 ? '' : 's'}`,
    category: t.category ?? '',
    image: t.coverImageUrl ?? '',
    rating: 0,
    reviewCount: 0,
    activities: t.days?.reduce(
      (acc: number, d: any) => acc + (d.items?.length ?? 0),
      0,
    ) ?? 0,
    description: t.description,
    featured: false,
    included: [],
    dailyItinerary: [],
    currency: t.currency,
  };
}

export const useExploreData = (): UseExploreDataResult => {
  const destinationsRaw = useQuery(api.destinations.list, {});
  const eventsRaw = useQuery(api.events.listPublished, {});
  const experiencesRaw = useQuery(api.experiences.listFeatured, {});
  const templatesRaw = useQuery(api.itinerary.listTemplates, {});

  // Convex's reactive cache makes manual refresh redundant; we keep a
  // no-op `refresh()` so existing pull-to-refresh callsites keep working.
  const [refreshing, setRefreshing] = useState(false);

  const loading =
    destinationsRaw === undefined ||
    eventsRaw === undefined ||
    experiencesRaw === undefined ||
    templatesRaw === undefined;

  const data: ExploreData = useMemo(
    () => ({
      destinations: (destinationsRaw ?? []).map(toDestination),
      events: (eventsRaw ?? []).map(toEvent),
      experiences: (experiencesRaw ?? []).map(toExperience),
      itineraries: (templatesRaw ?? []).map(toItineraryTemplate),
    }),
    [destinationsRaw, eventsRaw, experiencesRaw, templatesRaw],
  );

  const refresh = async () => {
    setRefreshing(true);
    // Convex auto-invalidates; nothing to do. Toggle the flag so the
    // RefreshControl spinner cycles instead of getting stuck.
    setTimeout(() => setRefreshing(false), 600);
  };

  return { data, loading, refreshing, error: null, refresh };
};
