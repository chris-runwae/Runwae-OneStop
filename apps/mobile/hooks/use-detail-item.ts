import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';

type DetailType = 'itinerary' | 'experience' | 'destination';

// Phase 4 read path: pulls from the same reactive list queries the
// Explore screen uses, so navigation between list and detail keeps the
// cache hot. Slug-based lookups (api.destinations.getBySlug etc.) are a
// follow-up — for now mobile routes on `_id` from list results.
export function useDetailItem(type: DetailType) {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const destinations = useQuery(
    api.destinations.list,
    type === 'destination' ? {} : 'skip',
  );
  const experiences = useQuery(
    api.experiences.listFeatured,
    type === 'experience' ? {} : 'skip',
  );
  const templates = useQuery(
    api.itinerary.listTemplates,
    type === 'itinerary' ? {} : 'skip',
  );

  const item = useMemo(() => {
    if (!id) return null;
    if (type === 'destination') {
      return (destinations ?? []).find(
        (d: any) => (d._id as unknown as string) === id,
      ) ?? null;
    }
    if (type === 'experience') {
      return (experiences ?? []).find(
        (e: any) => (e._id as unknown as string) === id,
      ) ?? null;
    }
    return (templates ?? []).find(
      (t: any) => (t._id as unknown as string) === id,
    ) ?? null;
  }, [id, type, destinations, experiences, templates]);

  const loading =
    (type === 'destination' && destinations === undefined) ||
    (type === 'experience' && experiences === undefined) ||
    (type === 'itinerary' && templates === undefined);

  return { id, item, loading, error: null as string | null };
}
