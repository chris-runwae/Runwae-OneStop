import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';

import type { Destination } from '@/types/content.types';

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

type UseDestinationsOptions = {
  featuredOnly?: boolean;
  limit?: number;
  search?: string;
};

type UseDestinationsReturn = {
  destinations: Destination[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useDestinations(
  options: UseDestinationsOptions = {},
): UseDestinationsReturn {
  const { featuredOnly = false, limit = 20, search } = options;

  const raw = useQuery(api.destinations.list, {
    featuredOnly,
    limit,
  });
  const loading = raw === undefined;

  const destinations = useMemo<Destination[]>(() => {
    const list = (raw ?? []).map(toDestination);
    if (!search?.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q),
    );
  }, [raw, search]);

  return { destinations, loading, error: null, refetch: () => {} };
}

type UseDestinationByIdReturn = {
  destination: Destination | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useDestinationById(
  id: string | null,
): UseDestinationByIdReturn {
  const raw = useQuery(api.destinations.list, id ? {} : 'skip');
  const loading = raw === undefined;

  const destination = useMemo<Destination | null>(() => {
    if (!raw || !id) return null;
    const match = raw.find((d: any) => (d._id as unknown as string) === id);
    return match ? toDestination(match) : null;
  }, [raw, id]);

  return { destination, loading, error: null, refetch: () => {} };
}
