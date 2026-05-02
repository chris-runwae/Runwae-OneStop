import { api } from "@runwae/convex/convex/_generated/api";
import type { Doc, Id } from "@runwae/convex/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

// ================================================================
// Types — mirror the flat Convex schema. Itinerary days/items live in
// their own tables keyed by `tripId`; there is no separate
// `itineraries` row anymore (the trip itself owns the days).
// ================================================================

export type ItemType = Doc<"itinerary_items">["type"];

export type ItineraryDay = Doc<"itinerary_days">;
export type ItineraryItem = Doc<"itinerary_items">;

export type ItineraryDayWithItems = ItineraryDay & {
  items: ItineraryItem[];
};

export interface AddItineraryItemInput {
  tripId: Id<"trips"> | string;
  dayId: Id<"itinerary_days"> | string;
  type: ItemType;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  startTime?: string;
  endTime?: string;
  locationName?: string;
  coords?: { lat: number; lng: number };
  bookingReference?: string;
  notes?: string;
  apiSource?: string;
  apiRef?: string;
  canBeEditedBy?: "creator_only" | "editors" | "all_members";
}

export interface UpdateItineraryItemInput {
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  startTime?: string;
  endTime?: string;
  locationName?: string;
  coords?: { lat: number; lng: number };
  bookingReference?: string;
  notes?: string;
  isCompleted?: boolean;
}

// Legacy alias kept while consumers finish migrating off the old shape.
// `CreateItineraryItemInput` used to require positional userId + dayId;
// the new flow lets Convex derive both from the mutation context.
export type CreateItineraryItemInput = Omit<AddItineraryItemInput, "tripId" | "dayId">;

// ================================================================
// Reactive query hooks
// ================================================================

/** Days + nested items for a trip, sorted by dayNumber/sortOrder. */
export function useItinerary(
  tripId: Id<"trips"> | string | undefined,
):
  | { days: ItineraryDayWithItems[] }
  | null
  | undefined {
  return useQuery(
    api.itinerary.getItinerary,
    tripId ? { tripId: tripId as Id<"trips"> } : "skip",
  );
}

/** Single day with travel-time legs between consecutive items. */
export function useDayWithTravelTimes(
  dayId: Id<"itinerary_days"> | string | undefined,
) {
  return useQuery(
    api.itinerary.getDayWithTravelTimes,
    dayId ? { dayId: dayId as Id<"itinerary_days"> } : "skip",
  );
}

// ================================================================
// Mutation hooks
// ================================================================

export function useAppendDay() {
  return useMutation(api.itinerary.appendDay);
}

export function useAddDay() {
  return useMutation(api.itinerary.addDay);
}

export function useAddItem() {
  return useMutation(api.itinerary.addItem);
}

export function useUpdateItem() {
  return useMutation(api.itinerary.updateItem);
}

export function useDeleteItem() {
  return useMutation(api.itinerary.deleteItem);
}

/**
 * Reorder a single item within (or across) days. The mobile drag-reorder
 * UI batches these calls in sequence; consumers can wrap with
 * `withOptimisticUpdate` at the call site if they need flicker-free reorders.
 */
export function useReorderItem() {
  return useMutation(api.itinerary.reorderItem);
}

// ================================================================
// Helpers — count derived from the reactive itinerary query.
// ================================================================

/** Total item count across all days for a trip. Reactive. */
export function useItineraryItemCount(
  tripId: Id<"trips"> | string | undefined,
): number | undefined {
  const itinerary = useItinerary(tripId);
  if (itinerary === undefined) return undefined;
  if (!itinerary) return 0;
  return itinerary.days.reduce((acc, d) => acc + d.items.length, 0);
}
