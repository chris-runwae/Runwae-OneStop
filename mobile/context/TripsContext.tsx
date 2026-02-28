import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { TripActions } from '@/hooks/useTripActions';
import type { Trip, CreateTripInput, UpdateTripInput, UpdateTripDetailsInput, MemberRole } from '@/hooks/useTripActions';
import type { LiteAPIPlace } from '@/hooks/usePlacesAutoComplete';

type TripsContextType = {
  // State
  myTrips: Trip[];
  joinedTrips: Trip[];
  activeTrip: Trip | null;
  isLoading: boolean;
  error: string | null;
  // List actions
  refreshMyTrips: () => Promise<void>;
  refreshJoinedTrips: () => Promise<void>;
  // Single trip actions
  loadTrip: (tripId: string) => Promise<void>;
  clearActiveTrip: () => void;
  createTrip: (input: CreateTripInput) => Promise<Trip>;
  updateTrip: (groupId: string, input: UpdateTripInput) => Promise<void>;
  updateTripDetails: (groupId: string, input: UpdateTripDetailsInput) => Promise<void>;
  updateDestination: (groupId: string, place: LiteAPIPlace) => Promise<void>;
  deleteTrip: (groupId: string) => Promise<void>;
  leaveTrip: (groupId: string) => Promise<void>;
  updateMemberRole: (groupId: string, targetUserId: string, role: MemberRole) => Promise<void>;
  removeMember: (groupId: string, targetUserId: string) => Promise<void>;
};

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export const TripsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [joinedTrips, setJoinedTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      setError(message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshMyTrips = useCallback(async () => {
    if (!user?.id) return;
    const data = await run(() => TripActions.fetchMyTrips(user.id));
    setMyTrips(data);
  }, [user?.id]);

  const refreshJoinedTrips = useCallback(async () => {
    if (!user?.id) return;
    const data = await run(() => TripActions.fetchJoinedTrips(user.id));
    setJoinedTrips(data);
  }, [user?.id]);

  const loadTrip = useCallback(async (tripId: string) => {
    const data = await run(() => TripActions.fetchTripById(tripId));
    setActiveTrip(data);
  }, []);

  const clearActiveTrip = useCallback(() => setActiveTrip(null), []);

  const createTrip = useCallback(async (input: CreateTripInput): Promise<Trip> => {
    if (!user?.id) throw new Error('Not authenticated');
    const trip = await run(() => TripActions.createTrip(user.id, input));
    setMyTrips(prev => [trip, ...prev]);
    return trip;
  }, [user?.id]);

  const updateTrip = useCallback(async (groupId: string, input: UpdateTripInput) => {
    const updated = await run(() => TripActions.updateTrip(groupId, input));
    setMyTrips(prev => prev.map(t => t.id === groupId ? { ...t, ...updated } : t));
    if (activeTrip?.id === groupId) setActiveTrip(prev => prev ? { ...prev, ...updated } : prev);
  }, [activeTrip?.id]);

  const updateTripDetails = useCallback(async (groupId: string, input: UpdateTripDetailsInput) => {
    const updated = await run(() => TripActions.updateTripDetails(groupId, input));
    const patch = (t: Trip) => t.id === groupId ? { ...t, trip_details: { ...t.trip_details, ...updated } as Trip['trip_details'] } : t;
    setMyTrips(prev => prev.map(patch));
    if (activeTrip?.id === groupId) setActiveTrip(prev => prev ? patch(prev) : prev);
  }, [activeTrip?.id]);

  const updateDestination = useCallback(async (groupId: string, place: LiteAPIPlace) => {
    const updated = await run(() => TripActions.updateDestination(groupId, place));
    const patch = (t: Trip) => t.id === groupId ? { ...t, trip_details: { ...t.trip_details, ...updated } as Trip['trip_details'] } : t;
    setMyTrips(prev => prev.map(patch));
    if (activeTrip?.id === groupId) setActiveTrip(prev => prev ? patch(prev) : prev);
  }, [activeTrip?.id]);

  const deleteTrip = useCallback(async (groupId: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    await run(() => TripActions.deleteTrip(groupId, user.id));
    setMyTrips(prev => prev.filter(t => t.id !== groupId));
    if (activeTrip?.id === groupId) setActiveTrip(null);
  }, [user?.id, activeTrip?.id]);

  const leaveTrip = useCallback(async (groupId: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    await run(() => TripActions.leaveTrip(groupId, user.id));
    setJoinedTrips(prev => prev.filter(t => t.id !== groupId));
  }, [user?.id]);

  const updateMemberRole = useCallback(async (groupId: string, targetUserId: string, role: MemberRole) => {
    await run(() => TripActions.updateMemberRole(groupId, targetUserId, role));
    if (activeTrip?.id === groupId) {
      setActiveTrip(prev => prev ? {
        ...prev,
        group_members: prev.group_members?.map(m =>
          m.user_id === targetUserId ? { ...m, role } : m
        ),
      } : prev);
    }
  }, [activeTrip?.id]);

  const removeMember = useCallback(async (groupId: string, targetUserId: string) => {
    await run(() => TripActions.removeMember(groupId, targetUserId));
    if (activeTrip?.id === groupId) {
      setActiveTrip(prev => prev ? {
        ...prev,
        group_members: prev.group_members?.filter(m => m.user_id !== targetUserId),
      } : prev);
    }
  }, [activeTrip?.id]);

  useEffect(() => {
    if (!user?.id) return;
    refreshMyTrips();
    refreshJoinedTrips();
  }, [user?.id]);

  return (
    <TripsContext.Provider value={{
      myTrips, joinedTrips, activeTrip, isLoading, error,
      refreshMyTrips, refreshJoinedTrips,
      loadTrip, clearActiveTrip,
      createTrip, updateTrip, updateTripDetails, updateDestination,
      deleteTrip, leaveTrip, updateMemberRole, removeMember,
    }}>
      {children}
    </TripsContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripsContext);
  if (!context) throw new Error('useTrips must be used within a TripsProvider');
  return context;
};