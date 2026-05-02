import { api } from "@runwae/convex/convex/_generated/api";
import type { Id } from "@runwae/convex/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";
import {
  type CreateSavedItemInput,
  type SavedItineraryItem,
  useAddSavedItem,
  useRemoveSavedItem,
  useSavedItems,
} from "@/hooks/useIdeaActions";
import {
  type ItineraryDayWithItems,
  type AddItineraryItemInput,
  type UpdateItineraryItemInput,
  useAddItem,
  useAppendDay,
  useDeleteItem,
  useItinerary,
  useReorderItem,
  useUpdateItem,
} from "@/hooks/useItineraryActions";
import {
  type CreateTripInput,
  type Trip,
  type TripMember,
  type TripMemberRole,
  type TripWithMembers,
  type UpdateTripInput,
  partitionTrips,
  useCreateTrip,
  useDeleteTrip,
  useJoinByCode,
  useMyTripsAll,
  useTripById,
  useTripMembers,
  useUpdateTrip,
} from "@/hooks/useTripActions";

// ================================================================
// Re-exports for screen consumers that pull these from TripsContext.
// ================================================================
export type { Trip, TripMember, TripWithMembers };

// ================================================================
// Context shape — kept close to the legacy API so existing screens
// stay readable, but every value is now derived from a Convex query.
// ================================================================

export interface TripsContextType {
  // Trip lists (reactive)
  myTrips: Trip[];
  joinedTrips: Trip[];

  // Active trip (reactive once loadTrip(id) is called)
  activeTrip: Trip | null;
  activeTripMembers: TripMember[];
  isLoading: boolean;
  error: string | null;

  // Itinerary + ideas (reactive on activeTripId)
  days: ItineraryDayWithItems[];
  itineraryLoading: boolean;
  ideas: SavedItineraryItem[];
  ideasLoading: boolean;

  // Lifecycle
  loadTrip: (id: string) => void;
  clearActiveTrip: () => void;
  refreshMyTrips: () => Promise<void>;
  refreshJoinedTrips: () => Promise<void>;

  // Trip mutations
  createTrip: (input: CreateTripInput) => Promise<{
    tripId: Id<"trips"> | null;
    slug: string | null;
    error: string | null;
  }>;
  updateTrip: (
    tripId: string,
    input: UpdateTripInput,
  ) => Promise<{ error: string | null }>;
  deleteTrip: (tripId: string) => Promise<{ error: string | null }>;
  leaveTrip: (tripId: string) => Promise<{ error: string | null }>;
  removeMember: (
    tripId: string,
    userId: string,
  ) => Promise<{ error: string | null }>;
  updateMemberRole: (
    tripId: string,
    userId: string,
    role: TripMemberRole,
  ) => Promise<{ error: string | null }>;

  // Itinerary actions
  addDay: (input?: { title?: string; notes?: string; date?: string }) => Promise<void>;
  updateDayCtx: (
    dayId: string,
    input: { title?: string; notes?: string; date?: string },
  ) => Promise<void>;
  removeDay: (dayId: string) => Promise<void>;
  addItem: (
    dayId: string,
    input: Omit<AddItineraryItemInput, "tripId" | "dayId">,
  ) => Promise<void>;
  updateItemCtx: (
    itemId: string,
    input: UpdateItineraryItemInput,
  ) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  reorderItemsCtx: (dayId: string, orderedIds: string[]) => Promise<void>;
  reorderDaysCtx: (orderedIds: string[]) => Promise<void>;
  moveItemToDayCtx: (
    itemId: string,
    fromDayId: string,
    toDayId: string,
  ) => Promise<void>;

  // Idea actions
  addIdea: (input: CreateSavedItemInput) => Promise<void>;
  addIdeaToTrip: (tripId: string, input: CreateSavedItemInput) => Promise<void>;
  removeIdea: (ideaId: string) => Promise<void>;

  // Membership
  joinTrip: (code: string) => Promise<string>;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

// ================================================================
// Provider
// ================================================================

export const TripsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const viewerUserId = user?.id;

  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reactive trip list — Convex pushes updates whenever a member or trip
  // row changes server-side, so manual refresh state is gone.
  const allTripsRaw = useMyTripsAll();
  const tripsLoading = allTripsRaw === undefined;
  const { myTrips, joinedTrips } = useMemo(
    () => partitionTrips(allTripsRaw, viewerUserId),
    [allTripsRaw, viewerUserId],
  );

  // Active trip + its members + itinerary + ideas all keyed off the same id.
  const activeTrip = useTripById(activeTripId ?? undefined) ?? null;
  const activeTripMembers = useTripMembers(activeTripId ?? undefined) ?? [];
  const itinerary = useItinerary(activeTripId ?? undefined);
  const ideasRaw = useSavedItems(activeTripId ?? undefined);

  const days: ItineraryDayWithItems[] = useMemo(() => {
    if (!itinerary) return [];
    return itinerary.days;
  }, [itinerary]);
  const itineraryLoading = activeTripId != null && itinerary === undefined;
  const ideas = ideasRaw ?? [];
  const ideasLoading = activeTripId != null && ideasRaw === undefined;

  // Mutation handles. Keep them at the provider level so callbacks stay
  // referentially stable across renders.
  const createTripMut = useCreateTrip();
  const updateTripMut = useUpdateTrip();
  const deleteTripMut = useDeleteTrip();
  const joinByCodeMut = useJoinByCode();
  const respondToInviteMut = useMutation(api.trips.respondToInvite);

  const appendDayMut = useAppendDay();
  const updateDayMut = useMutation(api.itinerary.updateDay);
  const deleteDayMut = useMutation(api.itinerary.deleteDay);
  const reorderDaysMut = useMutation(api.itinerary.reorderDays);
  const addItemMut = useAddItem();
  const updateItemMut = useUpdateItem();
  const deleteItemMut = useDeleteItem();
  const reorderItemMut = useReorderItem();

  const addSavedItemMut = useAddSavedItem();
  const removeSavedItemMut = useRemoveSavedItem();

  // ----------------------------------------------------------------
  // Lifecycle
  // ----------------------------------------------------------------

  const loadTrip = useCallback((id: string) => {
    setActiveTripId(id);
    setError(null);
  }, []);

  const clearActiveTrip = useCallback(() => {
    setActiveTripId(null);
  }, []);

  // No-ops kept for backwards compatibility — Convex's reactive cache
  // refreshes automatically. We resolve immediately so existing
  // `await refreshMyTrips()` callsites don't deadlock.
  const refreshMyTrips = useCallback(async () => {}, []);
  const refreshJoinedTrips = useCallback(async () => {}, []);

  // ----------------------------------------------------------------
  // Trip mutations
  // ----------------------------------------------------------------

  const createTrip = useCallback(
    async (input: CreateTripInput) => {
      try {
        const result = await createTripMut(input);
        return { tripId: result.tripId, slug: result.slug, error: null };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to create trip";
        setError(msg);
        return { tripId: null, slug: null, error: msg };
      }
    },
    [createTripMut],
  );

  const updateTrip = useCallback(
    async (tripId: string, input: UpdateTripInput) => {
      try {
        await updateTripMut({ tripId: tripId as Id<"trips">, ...input });
        return { error: null };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to update trip";
        setError(msg);
        return { error: msg };
      }
    },
    [updateTripMut],
  );

  const deleteTrip = useCallback(
    async (tripId: string) => {
      try {
        await deleteTripMut({ tripId: tripId as Id<"trips"> });
        if (activeTripId === tripId) setActiveTripId(null);
        return { error: null };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to delete trip";
        setError(msg);
        return { error: msg };
      }
    },
    [activeTripId, deleteTripMut],
  );

  // Self-leave is implemented as decline-on-an-accepted-row via
  // respondToInvite(false), which removes the trip_members row.
  const leaveTrip = useCallback(
    async (tripId: string) => {
      try {
        await respondToInviteMut({
          tripId: tripId as Id<"trips">,
          accept: false,
        });
        if (activeTripId === tripId) setActiveTripId(null);
        return { error: null };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to leave trip";
        setError(msg);
        return { error: msg };
      }
    },
    [activeTripId, respondToInviteMut],
  );

  // Member-management endpoints aren't yet exposed from the Convex
  // backend (the existing `members.ts` module is read-only). These
  // stubs preserve the legacy interface and surface a clear error so
  // we can wire them up alongside the friends/social work in Phase 6.
  const removeMember = useCallback(
    async (_tripId: string, _userId: string) => ({
      error: "Member removal isn't wired up yet",
    }),
    [],
  );
  const updateMemberRole = useCallback(
    async (_tripId: string, _userId: string, _role: TripMemberRole) => ({
      error: "Role updates aren't wired up yet",
    }),
    [],
  );

  // ----------------------------------------------------------------
  // Itinerary actions
  // ----------------------------------------------------------------

  const addDay = useCallback(
    async (input?: { title?: string; notes?: string; date?: string }) => {
      if (!activeTripId) return;
      // appendDay derives date/dayNumber server-side. The optional
      // `date` arg is currently ignored by the backend; new days land
      // immediately after the last existing day.
      await appendDayMut({
        tripId: activeTripId as Id<"trips">,
        title: input?.title,
        notes: input?.notes,
      });
    },
    [activeTripId, appendDayMut],
  );

  const updateDayCtx = useCallback(
    async (
      dayId: string,
      input: { title?: string; notes?: string; date?: string },
    ) => {
      await updateDayMut({
        dayId: dayId as Id<"itinerary_days">,
        ...input,
      });
    },
    [updateDayMut],
  );

  const removeDay = useCallback(
    async (dayId: string) => {
      await deleteDayMut({ dayId: dayId as Id<"itinerary_days"> });
    },
    [deleteDayMut],
  );

  const reorderDaysCtx = useCallback(
    async (orderedIds: string[]) => {
      if (!activeTripId) return;
      await reorderDaysMut({
        tripId: activeTripId as Id<"trips">,
        orderedDayIds: orderedIds.map(
          (id) => id as Id<"itinerary_days">,
        ),
      });
    },
    [activeTripId, reorderDaysMut],
  );

  const addItem = useCallback(
    async (
      dayId: string,
      input: Omit<AddItineraryItemInput, "tripId" | "dayId">,
    ) => {
      if (!activeTripId) return;
      await addItemMut({
        tripId: activeTripId as Id<"trips">,
        dayId: dayId as Id<"itinerary_days">,
        ...input,
      });
    },
    [activeTripId, addItemMut],
  );

  const updateItemCtx = useCallback(
    async (itemId: string, input: UpdateItineraryItemInput) => {
      await updateItemMut({
        itemId: itemId as Id<"itinerary_items">,
        ...input,
      });
    },
    [updateItemMut],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      await deleteItemMut({ itemId: itemId as Id<"itinerary_items"> });
    },
    [deleteItemMut],
  );

  // Drag-reorder within a day. Convex's `reorderItem` updates one row
  // at a time, so we fan out the new sort orders. The reactive
  // itinerary query repaints once the last write commits — for
  // flicker-free reordering, callers can wrap with
  // `withOptimisticUpdate` directly via the `useReorderItem` hook.
  const reorderItemsCtx = useCallback(
    async (_dayId: string, orderedIds: string[]) => {
      await Promise.all(
        orderedIds.map((id, sortOrder) =>
          reorderItemMut({
            itemId: id as Id<"itinerary_items">,
            sortOrder,
          }),
        ),
      );
    },
    [reorderItemMut],
  );

  const moveItemToDayCtx = useCallback(
    async (itemId: string, _fromDayId: string, toDayId: string) => {
      await reorderItemMut({
        itemId: itemId as Id<"itinerary_items">,
        dayId: toDayId as Id<"itinerary_days">,
        sortOrder: 0, // append at the top of the new day; UI can refine.
      });
    },
    [reorderItemMut],
  );

  // ----------------------------------------------------------------
  // Ideas / saved-items actions
  // ----------------------------------------------------------------

  const addIdea = useCallback(
    async (input: CreateSavedItemInput) => {
      if (!activeTripId) return;
      await addSavedItemMut({
        tripId: activeTripId as Id<"trips">,
        type: input.type,
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        price: input.price,
        currency: input.currency,
        date: input.date,
        endDate: input.endDate,
        locationName: input.locationName,
        coords: input.coords,
        externalUrl: input.externalUrl,
        apiSource: input.apiSource,
        apiRef: input.apiRef,
        notes: input.notes,
        isManual: input.isManual ?? false,
      });
    },
    [activeTripId, addSavedItemMut],
  );

  const addIdeaToTrip = useCallback(
    async (tripId: string, input: CreateSavedItemInput) => {
      await addSavedItemMut({
        tripId: tripId as Id<"trips">,
        type: input.type,
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        price: input.price,
        currency: input.currency,
        date: input.date,
        endDate: input.endDate,
        locationName: input.locationName,
        coords: input.coords,
        externalUrl: input.externalUrl,
        apiSource: input.apiSource,
        apiRef: input.apiRef,
        notes: input.notes,
        isManual: input.isManual ?? false,
      });
    },
    [addSavedItemMut],
  );

  const removeIdea = useCallback(
    async (ideaId: string) => {
      await removeSavedItemMut({
        savedItemId: ideaId as Id<"saved_items">,
      });
    },
    [removeSavedItemMut],
  );

  // ----------------------------------------------------------------
  // Join via invite code
  // ----------------------------------------------------------------

  const joinTrip = useCallback(
    async (code: string): Promise<string> => {
      const tripId = await joinByCodeMut({ joinCode: code });
      return tripId as unknown as string;
    },
    [joinByCodeMut],
  );

  const value: TripsContextType = {
    myTrips,
    joinedTrips,
    activeTrip,
    activeTripMembers,
    isLoading: tripsLoading,
    error,
    days,
    itineraryLoading,
    ideas,
    ideasLoading,
    loadTrip,
    clearActiveTrip,
    refreshMyTrips,
    refreshJoinedTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    leaveTrip,
    removeMember,
    updateMemberRole,
    addDay,
    updateDayCtx,
    removeDay,
    addItem,
    updateItemCtx,
    removeItem,
    reorderItemsCtx,
    reorderDaysCtx,
    moveItemToDayCtx,
    addIdea,
    addIdeaToTrip,
    removeIdea,
    joinTrip,
  };

  return (
    <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
  );
};

// ================================================================
// Hook
// ================================================================

export const useTrips = (): TripsContextType => {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error("useTrips must be used within a TripsProvider");
  }
  return context;
};
