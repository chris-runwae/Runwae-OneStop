import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';

import { Event } from '@/types/content.types';

// Convex stores events under their slug; the mobile router still routes
// on `_id` from list results, so we look up the matching row from the
// reactive `listPublished` cache instead of issuing a separate query.

function isoDateOnly(ms: number | undefined): string {
  if (!ms) return '';
  return new Date(ms).toISOString().slice(0, 10);
}
function isoTime(ms: number | undefined): string {
  if (!ms) return '';
  const d = new Date(ms);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(
    d.getUTCMinutes(),
  ).padStart(2, '0')}`;
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
  };
}

export function useEvent(id: string | string[] | undefined) {
  const allRaw = useQuery(api.events.listPublished, { limit: 100 });
  const loading = allRaw === undefined;

  const event = useMemo<Event | null>(() => {
    if (!id || Array.isArray(id) || !allRaw) return null;
    const match = allRaw.find((e: any) => (e._id as unknown as string) === id);
    return match ? toEvent(match) : null;
  }, [id, allRaw]);

  const relatedEvents = useMemo<Event[]>(() => {
    if (!event || !allRaw) return [];
    return allRaw
      .filter(
        (e: any) =>
          (e._id as unknown as string) !== event.id &&
          (e.category ?? 'event') === event.category,
      )
      .map(toEvent);
  }, [allRaw, event]);

  const otherEvents = useMemo<Event[]>(() => {
    if (!event || !allRaw) return [];
    return allRaw
      .filter(
        (e: any) =>
          (e._id as unknown as string) !== event.id &&
          (e.category ?? 'event') !== event.category,
      )
      .slice(0, 6)
      .map(toEvent);
  }, [allRaw, event]);

  return {
    event,
    relatedEvents,
    otherEvents,
    loading,
    error: null as Error | null,
    refresh: () => {},
  };
}
