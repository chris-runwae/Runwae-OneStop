import { useCallback, useMemo, useState } from 'react';

export type Airport = {
  iata: string;
  city: string;
  name?: string;
  country?: string;
};
export type TripType = 'one-way' | 'round-trip';

export type FlightSearchState = {
  origin: Airport | null;
  destination: Airport | null;
  depart: string | null; // YYYY-MM-DD
  returnDate: string | null; // YYYY-MM-DD
  adults: number;
  tripType: TripType;
};

const INITIAL: FlightSearchState = {
  origin: null,
  destination: null,
  depart: null,
  returnDate: null,
  adults: 1,
  tripType: 'one-way',
};

export function useFlightSearchState() {
  const [state, setState] = useState<FlightSearchState>(INITIAL);

  const setOrigin = useCallback(
    (origin: Airport | null) => setState((s) => ({ ...s, origin })),
    [],
  );
  const setDestination = useCallback(
    (destination: Airport | null) => setState((s) => ({ ...s, destination })),
    [],
  );
  const setDepart = useCallback(
    (depart: string | null) => setState((s) => ({ ...s, depart })),
    [],
  );
  const setReturnDate = useCallback(
    (returnDate: string | null) => setState((s) => ({ ...s, returnDate })),
    [],
  );
  const setAdults = useCallback(
    (adults: number) => setState((s) => ({ ...s, adults: Math.max(1, adults) })),
    [],
  );
  const setTripType = useCallback(
    (tripType: TripType) =>
      setState((s) => ({
        ...s,
        tripType,
        // Drop any return date when switching to one-way so a stale value
        // doesn't get sent to Duffel.
        returnDate: tripType === 'one-way' ? null : s.returnDate,
      })),
    [],
  );

  const isValid = useMemo(() => {
    if (!state.origin || !state.destination || !state.depart) return false;
    if (state.origin.iata === state.destination.iata) return false;
    if (state.tripType === 'round-trip' && !state.returnDate) return false;
    return true;
  }, [state]);

  const toQueryParams = useCallback((): Record<string, string> | null => {
    if (!isValid || !state.origin || !state.destination || !state.depart) {
      return null;
    }
    const params: Record<string, string> = {
      originIata: state.origin.iata,
      destinationIata: state.destination.iata,
      depart: state.depart,
      adults: String(state.adults),
      tripType: state.tripType,
      // Useful for the results header without an extra query.
      originCity: state.origin.city,
      destinationCity: state.destination.city,
    };
    if (state.tripType === 'round-trip' && state.returnDate) {
      params.returnDate = state.returnDate;
    }
    return params;
  }, [isValid, state]);

  return {
    state,
    setOrigin,
    setDestination,
    setDepart,
    setReturnDate,
    setAdults,
    setTripType,
    isValid,
    toQueryParams,
  };
}
