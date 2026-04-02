import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useAuth } from '@/context/AuthContext';
import {
  addMember,
  createTrip as createTripAction,
  deleteTrip as deleteTripAction,
  fetchJoinedTrips,
  fetchMyTrips,
  fetchTripById,
  GroupMember,
  GroupMemberRole,
  leaveTrip as leaveTripAction,
  removeMember as removeMemberAction,
  TripWithDetails,
  TripWithEverything,
  updateMemberRole as updateMemberRoleAction,
  updateTrip as updateTripAction,
  updateTripDetails as updateTripDetailsAction,
  updateDestination as updateDestinationAction,
  CreateTripInput,
  UpdateTripInput,
  UpdateTripDetailsInput,
  UpdateDestinationInput,
} from '@/hooks/useTripActions';
import {
  fetchOrCreateItinerary,
  fetchDaysWithItems,
  createDay as createDayAction,
  updateDay as updateDayAction,
  deleteDay as deleteDayAction,
  createItem as createItemAction,
  updateItem as updateItemAction,
  deleteItem as deleteItemAction,
  reorderItems as reorderItemsAction,
  reorderDays as reorderDaysAction,
  moveItemToDay as moveItemToDayAction,
  Itinerary,
  ItineraryDay,
  ItineraryDayWithItems,
  CreateItineraryItemInput,
  UpdateItineraryItemInput,
} from '@/hooks/useItineraryActions';
import {
  fetchSavedItems,
  createSavedItem,
  deleteSavedItem,
  SavedItineraryItem,
  CreateSavedItemInput,
} from '@/hooks/useIdeaActions';

// ================================================================
// Context shape
// ================================================================

export interface TripsContextType {
  // State
  myTrips: TripWithEverything[];
  joinedTrips: TripWithEverything[];
  activeTrip: TripWithEverything | null;
  isLoading: boolean;
  error: string | null;

  // Itinerary & Ideas state
  itinerary: Itinerary | null;
  days: ItineraryDayWithItems[];
  itineraryLoading: boolean;
  ideas: SavedItineraryItem[];
  ideasLoading: boolean;

  // Refresh
  refreshMyTrips: () => Promise<void>;
  refreshJoinedTrips: () => Promise<void>;

  // Active trip
  loadTrip: (id: string) => Promise<void>;
  clearActiveTrip: () => void;

  // Mutations
  createTrip: (
    input: CreateTripInput
  ) => Promise<{ groupId: string | null; error: string | null }>;
  updateTrip: (
    groupId: string,
    input: UpdateTripInput
  ) => Promise<{ error: string | null }>;
  updateTripDetails: (
    groupId: string,
    input: UpdateTripDetailsInput
  ) => Promise<{ error: string | null }>;
  updateDestination: (
    groupId: string,
    place: UpdateDestinationInput
  ) => Promise<{ error: string | null }>;
  deleteTrip: (groupId: string) => Promise<{ error: string | null }>;
  leaveTrip: (groupId: string) => Promise<{ error: string | null }>;
  updateMemberRole: (
    groupId: string,
    userId: string,
    role: GroupMemberRole
  ) => Promise<{ error: string | null }>;
  removeMember: (
    groupId: string,
    userId: string
  ) => Promise<{ error: string | null }>;

  // Itinerary actions
  loadItinerary: (groupId: string) => Promise<void>;
  refreshItinerary: () => Promise<void>;
  addDay: (input: { title?: string; date?: string }) => Promise<void>;
  updateDayCtx: (dayId: string, input: Partial<ItineraryDay>) => Promise<void>;
  removeDay: (dayId: string) => Promise<void>;
  addItem: (dayId: string, input: CreateItineraryItemInput) => Promise<void>;
  updateItemCtx: (
    itemId: string,
    input: UpdateItineraryItemInput
  ) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  reorderItemsCtx: (dayId: string, orderedIds: string[]) => Promise<void>;
  reorderDaysCtx: (orderedIds: string[]) => Promise<void>;
  moveItemToDayCtx: (itemId: string, fromDayId: string, toDayId: string) => Promise<void>;
 
  // Ideas actions
  loadIdeas: (groupId: string) => Promise<void>;
  addIdea: (input: CreateSavedItemInput) => Promise<void>;
  removeIdea: (ideaId: string) => Promise<void>;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

// ================================================================
// Provider
// ================================================================

export const TripsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [myTrips, setMyTrips] = useState<TripWithEverything[]>([]);
  const [joinedTrips, setJoinedTrips] = useState<TripWithEverything[]>([]);
  const [activeTrip, setActiveTrip] = useState<TripWithEverything | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Itinerary & Ideas state
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [days, setDays] = useState<ItineraryDayWithItems[]>([]);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [ideas, setIdeas] = useState<SavedItineraryItem[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);

  // Prevent double-fetch on StrictMode double-mount
  const initialFetchDone = useRef(false);

  // ----------------------------------------------------------------
  // Refresh helpers
  // ----------------------------------------------------------------

  const refreshMyTrips = useCallback(async () => {
    if (!user?.id) return;
    const { data, error: err } = await fetchMyTrips(user.id);
    if (err) {
      setError(err);
    } else {
      setMyTrips(data ?? []);
    }
  }, [user?.id]);

  const refreshJoinedTrips = useCallback(async () => {
    if (!user?.id) return;
    const { data, error: err } = await fetchJoinedTrips(user.id);
    if (err) {
      setError(err);
    } else {
      setJoinedTrips(data ?? []);
    }
  }, [user?.id]);

  // ----------------------------------------------------------------
  // On mount / user change: fetch both lists
  // ----------------------------------------------------------------

  useEffect(() => {
    if (!user?.id) {
      setMyTrips([]);
      setJoinedTrips([]);
      setActiveTrip(null);
      initialFetchDone.current = false;
      return;
    }

    if (initialFetchDone.current) return;
    initialFetchDone.current = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      await Promise.all([refreshMyTrips(), refreshJoinedTrips()]);
      setIsLoading(false);
    };

    load();
  }, [user?.id, refreshMyTrips, refreshJoinedTrips]);

  // ----------------------------------------------------------------
  // Itinerary helpers
  // ----------------------------------------------------------------

  const loadItinerary = useCallback(
    async (groupId: string) => {
      if (!user?.id) return;
      setItineraryLoading(true);
      try {
        const itin = await fetchOrCreateItinerary(groupId, user.id);
        setItinerary(itin);
        const daysWithItems = await fetchDaysWithItems(itin.id);
        setDays(daysWithItems);
      } catch (err) {
        console.error('Failed to load itinerary:', err);
      } finally {
        setItineraryLoading(false);
      }
    },
    [user?.id]
  );

  const refreshItinerary = useCallback(async () => {
    if (!itinerary) return;
    const daysWithItems = await fetchDaysWithItems(itinerary.id);
    setDays(daysWithItems);
  }, [itinerary]);

  const addDay = useCallback(
    async (input: { title?: string; date?: string }) => {
      if (!itinerary) return;
      const newDay = await createDayAction(itinerary.id, input);
      setDays((prev) => [...prev, { ...newDay, itinerary_items: [] }]);
    },
    [itinerary]
  );

  const updateDayCtx = useCallback(
    async (dayId: string, input: Partial<ItineraryDay>) => {
      const prevDays = days;
      setDays((prev) =>
        prev.map((d) => (d.id === dayId ? { ...d, ...input } : d))
      );
      try {
        await updateDayAction(dayId, input);
      } catch (err) {
        setDays(prevDays);
        throw err;
      }
    },
    [days]
  );

  const removeDay = useCallback(
    async (dayId: string) => {
      const prevDays = days;
      setDays((prev) => prev.filter((d) => d.id !== dayId));
      try {
        await deleteDayAction(dayId);
      } catch (err) {
        setDays(prevDays);
        throw err;
      }
    },
    [days]
  );

  const addItem = useCallback(
    async (dayId: string, input: CreateItineraryItemInput) => {
      if (!user?.id) return;
      const newItem = await createItemAction(dayId, input, user.id);
      setDays((prev) =>
        prev.map((d) =>
          d.id === dayId
            ? { ...d, itinerary_items: [...d.itinerary_items, newItem] }
            : d
        )
      );
    },
    [user?.id]
  );

  const updateItemCtx = useCallback(
    async (itemId: string, input: UpdateItineraryItemInput) => {
      const prevDays = days;
      setDays((prev) =>
        prev.map((d) => ({
          ...d,
          itinerary_items: d.itinerary_items.map((it) =>
            it.id === itemId ? { ...it, ...input } : it
          ),
        }))
      );
      try {
        await updateItemAction(itemId, input);
      } catch (err) {
        setDays(prevDays);
        throw err;
      }
    },
    [days]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const prevDays = days;
      setDays((prev) =>
        prev.map((d) => ({
          ...d,
          itinerary_items: d.itinerary_items.filter((it) => it.id !== itemId),
        }))
      );
      try {
        await deleteItemAction(itemId);
      } catch (err) {
        setDays(prevDays);
        throw err;
      }
    },
    [days]
  );

  const reorderItemsCtx = useCallback(
    async (dayId: string, orderedIds: string[]) => {
      setDays((prev) =>
        prev.map((d) => {
          if (d.id !== dayId) return d;
          const sorted = orderedIds
            .map((id) => d.itinerary_items.find((it) => it.id === id))
            .filter(Boolean) as typeof d.itinerary_items;
          return { ...d, itinerary_items: sorted };
        })
      );
      await reorderItemsAction(dayId, orderedIds);
    },
    []
  );

  const reorderDaysCtx = useCallback(
    async (orderedIds: string[]) => {
      setDays((prev) => {
        const sorted = orderedIds
          .map((id) => prev.find((d) => d.id === id))
          .filter(Boolean) as ItineraryDayWithItems[];
        return sorted;
      });
      if (!itinerary) return;
      await reorderDaysAction(itinerary.id, orderedIds);
    },
    [itinerary]
  );

  const moveItemToDayCtx = useCallback(
    async (itemId: string, fromDayId: string, toDayId: string) => {
      const prevDays = days;
      setDays((prev) => {
        const item = prev.flatMap((d) => d.itinerary_items).find((it) => it.id === itemId);
        if (!item) return prev;
        
        return prev.map((d) => {
          if (d.id === fromDayId) {
            return {
              ...d,
              itinerary_items: d.itinerary_items.filter((it) => it.id !== itemId),
            };
          }
          if (d.id === toDayId) {
            return {
              ...d,
              itinerary_items: [...d.itinerary_items, { ...item, day_id: toDayId }],
            };
          }
          return d;
        });
      });
 
      try {
        await moveItemToDayAction(itemId, toDayId);
      } catch (err) {
        setDays(prevDays);
        throw err;
      }
    },
    [days]
  );
 
  // ----------------------------------------------------------------
  // Ideas / saved items helpers
  // ----------------------------------------------------------------
 
  const loadIdeas = useCallback(async (groupId: string) => {
    setIdeasLoading(true);
    try {
      const data = await fetchSavedItems(groupId);
      setIdeas(data);
    } catch (err) {
      console.error('Failed to load ideas:', err);
    } finally {
      setIdeasLoading(false);
    }
  }, []);
 
  const addIdea = useCallback(
    async (input: CreateSavedItemInput) => {
      if (!user?.id || !activeTrip) return;
      try {
        const newItem = await createSavedItem(activeTrip.id, user.id, input);
        setIdeas((prev) => [newItem, ...prev]);
      } catch (err) {
        console.error('Failed to add idea:', err);
      }
    },
    [user?.id, activeTrip]
  );
 
  const removeIdea = useCallback(async (ideaId: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    try {
      await deleteSavedItem(ideaId);
    } catch (err) {
      console.error('Failed to remove idea:', err);
    }
  }, []);
 
  // ----------------------------------------------------------------
  // Active trip
  // ----------------------------------------------------------------

  const loadTrip = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      const { data, error: err } = await fetchTripById(id);
      if (err) {
        setError(err);
      } else {
        setActiveTrip(data);
        // Load itinerary and ideas alongside the trip data.
        await Promise.all([loadItinerary(id), loadIdeas(id)]);
      }
      setIsLoading(false);
    },
    [loadItinerary, loadIdeas]
  );
 
  const clearActiveTrip = useCallback(() => {
    setActiveTrip(null);
    setItinerary(null);
    setDays([]);
    setIdeas([]);
  }, []);

  // ----------------------------------------------------------------
  // createTrip — optimistic insert at head of myTrips
  // ----------------------------------------------------------------

  const createTrip = useCallback(
    async (
      input: CreateTripInput
    ): Promise<{ groupId: string | null; error: string | null }> => {
      if (!user?.id) return { groupId: null, error: 'Not authenticated' };

      const { data, error: err } = await createTripAction(user.id, input);
      if (err || !data)
        return { groupId: null, error: err ?? 'Failed to create trip' };

      // Insert at the head — newest first matches fetchMyTrips ordering
      setMyTrips((prev) => [data as unknown as TripWithEverything, ...prev]);
      return { groupId: data.id, error: null };
    },
    [user?.id]
  );

  // ----------------------------------------------------------------
  // updateTrip — optimistic update in myTrips, joinedTrips, activeTrip
  // ----------------------------------------------------------------

  const updateTrip = useCallback(
    async (
      groupId: string,
      input: UpdateTripInput
    ): Promise<{ error: string | null }> => {
      // Snapshot for rollback
      const prevMyTrips = myTrips;
      const prevJoined = joinedTrips;
      const prevActiveTrip = activeTrip;

      const applyPatch = (trip: TripWithEverything) =>
        trip.id === groupId ? { ...trip, ...input } : trip;

      setMyTrips((prev) => prev.map(applyPatch));
      setJoinedTrips((prev) => prev.map(applyPatch));
      if (activeTrip?.id === groupId) {
        setActiveTrip((prev) => (prev ? { ...prev, ...input } : prev));
      }

      const { error: err } = await updateTripAction(groupId, input);
      if (err) {
        setMyTrips(prevMyTrips);
        setJoinedTrips(prevJoined);
        setActiveTrip(prevActiveTrip);
        setError(err);
        return { error: err };
      }
      return { error: null };
    },
    [myTrips, joinedTrips, activeTrip]
  );

  // ----------------------------------------------------------------
  // updateTripDetails — optimistic patch of nested trip_details
  // ----------------------------------------------------------------

  const updateTripDetails = useCallback(
    async (
      groupId: string,
      input: UpdateTripDetailsInput
    ): Promise<{ error: string | null }> => {
      const prevMyTrips = myTrips;
      const prevJoined = joinedTrips;
      const prevActiveTrip = activeTrip;

      const applyPatch = (trip: TripWithEverything) =>
        trip.id === groupId
          ? {
              ...trip,
              trip_details: trip.trip_details
                ? { ...trip.trip_details, ...input }
                : trip.trip_details,
            }
          : trip;

      setMyTrips((prev) => prev.map(applyPatch));
      setJoinedTrips((prev) => prev.map(applyPatch));
      if (activeTrip?.id === groupId) {
        setActiveTrip((prev) =>
          prev
            ? {
                ...prev,
                trip_details: prev.trip_details
                  ? { ...prev.trip_details, ...input }
                  : prev.trip_details,
              }
            : prev
        );
      }

      const { error: err } = await updateTripDetailsAction(groupId, input);
      if (err) {
        setMyTrips(prevMyTrips);
        setJoinedTrips(prevJoined);
        setActiveTrip(prevActiveTrip);
        setError(err);
        return { error: err };
      }
      return { error: null };
    },
    [myTrips, joinedTrips, activeTrip]
  );

  // ----------------------------------------------------------------
  // updateDestination — optimistic patch of destination fields
  // ----------------------------------------------------------------

  const updateDestination = useCallback(
    async (
      groupId: string,
      place: UpdateDestinationInput
    ): Promise<{ error: string | null }> => {
      const prevMyTrips = myTrips;
      const prevJoined = joinedTrips;
      const prevActiveTrip = activeTrip;

      const applyPatch = (trip: TripWithEverything) =>
        trip.id === groupId ? { ...trip, ...place } : trip;

      setMyTrips((prev) => prev.map(applyPatch));
      setJoinedTrips((prev) => prev.map(applyPatch));
      if (activeTrip?.id === groupId) {
        setActiveTrip((prev) => (prev ? { ...prev, ...place } : prev));
      }

      const { error: err } = await updateDestinationAction(groupId, place);
      if (err) {
        setMyTrips(prevMyTrips);
        setJoinedTrips(prevJoined);
        setActiveTrip(prevActiveTrip);
        setError(err);
        return { error: err };
      }
      return { error: null };
    },
    [myTrips, joinedTrips, activeTrip]
  );

  // ----------------------------------------------------------------
  // deleteTrip — optimistic removal from both lists
  // ----------------------------------------------------------------

  const deleteTrip = useCallback(
    async (groupId: string): Promise<{ error: string | null }> => {
      const prevMyTrips = myTrips;
      const prevJoined = joinedTrips;
      const prevActiveTrip = activeTrip;

      setMyTrips((prev) => prev.filter((t) => t.id !== groupId));
      setJoinedTrips((prev) => prev.filter((t) => t.id !== groupId));
      if (activeTrip?.id === groupId) setActiveTrip(null);

      const { error: err } = await deleteTripAction(groupId);
      if (err) {
        setMyTrips(prevMyTrips);
        setJoinedTrips(prevJoined);
        setActiveTrip(prevActiveTrip);
        setError(err);
        return { error: err };
      }
      return { error: null };
    },
    [myTrips, joinedTrips, activeTrip]
  );

  // ----------------------------------------------------------------
  // leaveTrip — optimistic removal from joinedTrips
  // ----------------------------------------------------------------

  const leaveTrip = useCallback(
    async (groupId: string): Promise<{ error: string | null }> => {
      if (!user?.id) return { error: 'Not authenticated' };

      const prevJoined = joinedTrips;
      const prevActiveTrip = activeTrip;

      setJoinedTrips((prev) => prev.filter((t) => t.id !== groupId));
      if (activeTrip?.id === groupId) setActiveTrip(null);

      const { error: err } = await leaveTripAction(groupId, user.id);
      if (err) {
        setJoinedTrips(prevJoined);
        setActiveTrip(prevActiveTrip);
        setError(err);
        return { error: err };
      }
      return { error: null };
    },
    [user?.id, joinedTrips, activeTrip]
  );

  // ----------------------------------------------------------------
  // updateMemberRole — optimistic patch on activeTrip.group_members
  // ----------------------------------------------------------------

  const updateMemberRole = useCallback(
    async (
      groupId: string,
      userId: string,
      role: GroupMemberRole
    ): Promise<{ error: string | null }> => {
      const prevActiveTrip = activeTrip;

      if (activeTrip?.id === groupId) {
        setActiveTrip((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            group_members: prev.group_members.map((m) =>
              m.user_id === userId ? { ...m, role } : m
            ),
          };
        });
      }

      const { error: err } = await updateMemberRoleAction(
        groupId,
        userId,
        role
      );
      if (err) {
        setActiveTrip(prevActiveTrip);
        setError(err);
        return { error: err };
      }
      return { error: null };
    },
    [activeTrip]
  );

  // ----------------------------------------------------------------
  // removeMember — optimistic removal from activeTrip.group_members
  // ----------------------------------------------------------------

  const removeMember = useCallback(
    async (
      groupId: string,
      userId: string
    ): Promise<{ error: string | null }> => {
      const prevActiveTrip = activeTrip;

      if (activeTrip?.id === groupId) {
        setActiveTrip((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            group_members: prev.group_members.filter(
              (m) => m.user_id !== userId
            ),
          };
        });
      }

      const { error: err } = await removeMemberAction(groupId, userId);
      if (err) {
        setActiveTrip(prevActiveTrip);
        setError(err);
        return { error: err };
      }
      return { error: null };
    },
    [activeTrip]
  );

  // ----------------------------------------------------------------
  // Context value
  // ----------------------------------------------------------------

  return (
    <TripsContext.Provider
      value={{
        myTrips,
        joinedTrips,
        activeTrip,
        isLoading,
        error,
        itinerary,
        days,
        itineraryLoading,
        refreshMyTrips,
        refreshJoinedTrips,
        loadTrip,
        clearActiveTrip,
        createTrip,
        updateTrip,
        updateTripDetails,
        updateDestination,
        deleteTrip,
        leaveTrip,
        updateMemberRole,
        removeMember,
        loadItinerary,
        refreshItinerary,
        addDay,
        updateDayCtx,
        removeDay,
        addItem,
        updateItemCtx,
        removeItem,
        reorderItemsCtx,
        reorderDaysCtx,
        moveItemToDayCtx,
        ideas,
        ideasLoading,
        loadIdeas,
        addIdea,
        removeIdea,
      }}>
      {children}
    </TripsContext.Provider>
  );
};

// ================================================================
// Hook
// ================================================================

export const useTrips = (): TripsContextType => {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
};
