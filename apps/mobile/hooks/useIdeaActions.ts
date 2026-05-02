import { api } from "@runwae/convex/convex/_generated/api";
import type { Doc, Id } from "@runwae/convex/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import type { ItemType } from "./useItineraryActions";

// ================================================================
// Types — saved_items live one-per-trip in Convex. Comments are a
// sibling table; promotion to itinerary uses a dedicated mutation.
// ================================================================

export type SavedItineraryItem = Doc<"saved_items">;

export interface CreateSavedItemInput {
  type: ItemType;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  date?: string;
  endDate?: string;
  locationName?: string;
  coords?: { lat: number; lng: number };
  externalUrl?: string;
  apiSource?: string;
  apiRef?: string;
  notes?: string;
  isManual?: boolean;
}

// ================================================================
// Reactive query hooks
// ================================================================

/** All saved items for a trip, optionally filtered by type. */
export function useSavedItems(
  tripId: Id<"trips"> | string | undefined,
  type?: ItemType,
): SavedItineraryItem[] | undefined {
  return useQuery(
    api.saved_items.getSavedItems,
    tripId
      ? { tripId: tripId as Id<"trips">, ...(type ? { type } : {}) }
      : "skip",
  );
}

export function useSavedItemComments(
  savedItemId: Id<"saved_items"> | string | undefined,
) {
  return useQuery(
    api.saved_items.getComments,
    savedItemId
      ? { savedItemId: savedItemId as Id<"saved_items"> }
      : "skip",
  );
}

// ================================================================
// Mutation hooks
// ================================================================

export function useAddSavedItem() {
  return useMutation(api.saved_items.addSavedItem);
}

export function useRemoveSavedItem() {
  return useMutation(api.saved_items.removeSavedItem);
}

export function useAddSavedItemComment() {
  return useMutation(api.saved_items.addComment);
}

export function useRemoveSavedItemComment() {
  return useMutation(api.saved_items.removeComment);
}

export function usePromoteToItinerary() {
  return useMutation(api.saved_items.promoteToItinerary);
}
