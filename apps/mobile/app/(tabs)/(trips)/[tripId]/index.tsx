import { useTrips } from '@/context/TripsContext';
import TripDetailScreen from '@/screens/trip/TripDetailScreen';
import { api } from '@runwae/convex/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';

// Trip slugs follow `kebab-title-<nanoid>` so they always contain at least
// one hyphen. Convex document ids are bareword tokens with no hyphens, so
// the presence of a hyphen reliably distinguishes a slug deep-link from an
// id-based one (poll cards and friends-activity navigate by slug, while
// `TripCard` and post-create flows navigate by id).
function isSlug(value: string): boolean {
  return value.includes('-');
}

export default function TripDetailRoute() {
  const { tripId: routeParam } = useLocalSearchParams<{ tripId: string }>();
  const { loadTrip, clearActiveTrip } = useTrips();

  const slugLookup = useQuery(
    api.trips.getBySlug,
    routeParam && isSlug(routeParam) ? { slug: routeParam } : 'skip',
  );

  const resolvedTripId =
    routeParam && isSlug(routeParam)
      ? (slugLookup?._id as unknown as string | undefined)
      : routeParam;

  useFocusEffect(
    useCallback(() => {
      if (resolvedTripId) loadTrip(resolvedTripId);
      return () => {
        clearActiveTrip();
      };
    }, [resolvedTripId, loadTrip, clearActiveTrip])
  );

  return <TripDetailScreen />;
}
