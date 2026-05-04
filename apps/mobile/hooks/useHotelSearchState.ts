import { useCallback, useMemo, useState } from 'react';

export type HotelSearchState = {
  destination: string | null;
  checkIn: string | null; // YYYY-MM-DD
  checkOut: string | null; // YYYY-MM-DD
  adults: number;
  rooms: number;
};

const INITIAL: HotelSearchState = {
  destination: null,
  checkIn: null,
  checkOut: null,
  adults: 2,
  rooms: 1,
};

export function useHotelSearchState() {
  const [state, setState] = useState<HotelSearchState>(INITIAL);

  const setDestination = useCallback(
    (destination: string | null) =>
      setState((s) => ({ ...s, destination: destination?.trim() || null })),
    [],
  );
  const setDates = useCallback(
    (checkIn: string | null, checkOut: string | null) =>
      setState((s) => ({ ...s, checkIn, checkOut })),
    [],
  );
  const setAdults = useCallback(
    (adults: number) =>
      setState((s) => ({ ...s, adults: Math.max(1, Math.min(8, adults)) })),
    [],
  );
  const setRooms = useCallback(
    (rooms: number) =>
      setState((s) => ({ ...s, rooms: Math.max(1, Math.min(4, rooms)) })),
    [],
  );

  const isValid = useMemo(() => {
    if (!state.destination || !state.checkIn || !state.checkOut) return false;
    return state.checkIn < state.checkOut;
  }, [state]);

  const toQueryParams = useCallback((): Record<string, string> | null => {
    if (!isValid || !state.destination || !state.checkIn || !state.checkOut) {
      return null;
    }
    return {
      destination: state.destination,
      checkin: state.checkIn,
      checkout: state.checkOut,
      adults: String(state.adults),
      rooms: String(state.rooms),
    };
  }, [isValid, state]);

  return {
    state,
    setDestination,
    setDates,
    setAdults,
    setRooms,
    isValid,
    toQueryParams,
  };
}
