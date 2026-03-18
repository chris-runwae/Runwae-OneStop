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

// ================================================================
// Context shape
// ================================================================

export interface TripsContextType {
  // State
  myTrips:      TripWithDetails[];
  joinedTrips:  TripWithDetails[];
  activeTrip:   TripWithEverything | null;
  isLoading:    boolean;
  error:        string | null;

  // Refresh
  refreshMyTrips:     () => Promise<void>;
  refreshJoinedTrips: () => Promise<void>;

  // Active trip
  loadTrip:      (id: string) => Promise<void>;
  clearActiveTrip: () => void;

  // Mutations
  createTrip:        (input: CreateTripInput) => Promise<{ error: string | null }>;
  updateTrip:        (groupId: string, input: UpdateTripInput) => Promise<{ error: string | null }>;
  updateTripDetails: (groupId: string, input: UpdateTripDetailsInput) => Promise<{ error: string | null }>;
  updateDestination: (groupId: string, place: UpdateDestinationInput) => Promise<{ error: string | null }>;
  deleteTrip:        (groupId: string) => Promise<{ error: string | null }>;
  leaveTrip:         (groupId: string) => Promise<{ error: string | null }>;
  updateMemberRole:  (groupId: string, userId: string, role: GroupMemberRole) => Promise<{ error: string | null }>;
  removeMember:      (groupId: string, userId: string) => Promise<{ error: string | null }>;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

// ================================================================
// Provider
// ================================================================

export const TripsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [myTrips,     setMyTrips]     = useState<TripWithDetails[]>([]);
  const [joinedTrips, setJoinedTrips] = useState<TripWithDetails[]>([]);
  const [activeTrip,  setActiveTrip]  = useState<TripWithEverything | null>(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

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
  // Active trip
  // ----------------------------------------------------------------

  const loadTrip = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await fetchTripById(id);
    if (err) {
      setError(err);
    } else {
      setActiveTrip(data);
    }
    setIsLoading(false);
  }, []);

  const clearActiveTrip = useCallback(() => {
    setActiveTrip(null);
  }, []);

  // ----------------------------------------------------------------
  // createTrip — optimistic insert at head of myTrips
  // ----------------------------------------------------------------

  const createTrip = useCallback(async (
    input: CreateTripInput,
  ): Promise<{ error: string | null }> => {
    if (!user?.id) return { error: 'Not authenticated' };

    const { data, error: err } = await createTripAction(user.id, input);
    if (err || !data) return { error: err ?? 'Failed to create trip' };

    // Insert at the head — newest first matches fetchMyTrips ordering
    setMyTrips((prev) => [data, ...prev]);
    return { error: null };
  }, [user?.id]);

  // ----------------------------------------------------------------
  // updateTrip — optimistic update in myTrips, joinedTrips, activeTrip
  // ----------------------------------------------------------------

  const updateTrip = useCallback(async (
    groupId: string,
    input: UpdateTripInput,
  ): Promise<{ error: string | null }> => {
    // Snapshot for rollback
    const prevMyTrips    = myTrips;
    const prevJoined     = joinedTrips;
    const prevActiveTrip = activeTrip;

    const applyPatch = (trip: TripWithDetails) =>
      trip.id === groupId ? { ...trip, ...input } : trip;

    setMyTrips((prev)    => prev.map(applyPatch));
    setJoinedTrips((prev) => prev.map(applyPatch));
    if (activeTrip?.id === groupId) {
      setActiveTrip((prev) => prev ? { ...prev, ...input } : prev);
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
  }, [myTrips, joinedTrips, activeTrip]);

  // ----------------------------------------------------------------
  // updateTripDetails — optimistic patch of nested trip_details
  // ----------------------------------------------------------------

  const updateTripDetails = useCallback(async (
    groupId: string,
    input: UpdateTripDetailsInput,
  ): Promise<{ error: string | null }> => {
    const prevMyTrips    = myTrips;
    const prevJoined     = joinedTrips;
    const prevActiveTrip = activeTrip;

    const applyPatch = (trip: TripWithDetails) =>
      trip.id === groupId
        ? { ...trip, trip_details: trip.trip_details ? { ...trip.trip_details, ...input } : trip.trip_details }
        : trip;

    setMyTrips((prev)    => prev.map(applyPatch));
    setJoinedTrips((prev) => prev.map(applyPatch));
    if (activeTrip?.id === groupId) {
      setActiveTrip((prev) =>
        prev
          ? { ...prev, trip_details: prev.trip_details ? { ...prev.trip_details, ...input } : prev.trip_details }
          : prev,
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
  }, [myTrips, joinedTrips, activeTrip]);

  // ----------------------------------------------------------------
  // updateDestination — optimistic patch of destination fields
  // ----------------------------------------------------------------

  const updateDestination = useCallback(async (
    groupId: string,
    place: UpdateDestinationInput,
  ): Promise<{ error: string | null }> => {
    const prevMyTrips    = myTrips;
    const prevJoined     = joinedTrips;
    const prevActiveTrip = activeTrip;

    const applyPatch = (trip: TripWithDetails) =>
      trip.id === groupId ? { ...trip, ...place } : trip;

    setMyTrips((prev)    => prev.map(applyPatch));
    setJoinedTrips((prev) => prev.map(applyPatch));
    if (activeTrip?.id === groupId) {
      setActiveTrip((prev) => prev ? { ...prev, ...place } : prev);
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
  }, [myTrips, joinedTrips, activeTrip]);

  // ----------------------------------------------------------------
  // deleteTrip — optimistic removal from both lists
  // ----------------------------------------------------------------

  const deleteTrip = useCallback(async (
    groupId: string,
  ): Promise<{ error: string | null }> => {
    const prevMyTrips    = myTrips;
    const prevJoined     = joinedTrips;
    const prevActiveTrip = activeTrip;

    setMyTrips((prev)    => prev.filter((t) => t.id !== groupId));
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
  }, [myTrips, joinedTrips, activeTrip]);

  // ----------------------------------------------------------------
  // leaveTrip — optimistic removal from joinedTrips
  // ----------------------------------------------------------------

  const leaveTrip = useCallback(async (
    groupId: string,
  ): Promise<{ error: string | null }> => {
    if (!user?.id) return { error: 'Not authenticated' };

    const prevJoined     = joinedTrips;
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
  }, [user?.id, joinedTrips, activeTrip]);

  // ----------------------------------------------------------------
  // updateMemberRole — optimistic patch on activeTrip.group_members
  // ----------------------------------------------------------------

  const updateMemberRole = useCallback(async (
    groupId: string,
    userId: string,
    role: GroupMemberRole,
  ): Promise<{ error: string | null }> => {
    const prevActiveTrip = activeTrip;

    if (activeTrip?.id === groupId) {
      setActiveTrip((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          group_members: prev.group_members.map((m) =>
            m.user_id === userId ? { ...m, role } : m,
          ),
        };
      });
    }

    const { error: err } = await updateMemberRoleAction(groupId, userId, role);
    if (err) {
      setActiveTrip(prevActiveTrip);
      setError(err);
      return { error: err };
    }
    return { error: null };
  }, [activeTrip]);

  // ----------------------------------------------------------------
  // removeMember — optimistic removal from activeTrip.group_members
  // ----------------------------------------------------------------

  const removeMember = useCallback(async (
    groupId: string,
    userId: string,
  ): Promise<{ error: string | null }> => {
    const prevActiveTrip = activeTrip;

    if (activeTrip?.id === groupId) {
      setActiveTrip((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          group_members: prev.group_members.filter((m) => m.user_id !== userId),
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
  }, [activeTrip]);

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
      }}
    >
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
