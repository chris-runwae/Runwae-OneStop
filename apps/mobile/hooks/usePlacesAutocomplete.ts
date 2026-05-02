import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useAction } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';

export interface LiteAPIPlace {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  types: string[];
}

interface UsePlacesAutocompleteResult {
  query: string;
  setQuery: (q: string) => void;
  results: LiteAPIPlace[];
  loading: boolean;
  error: string | null;
  clearResults: () => void;
}

export function usePlacesAutocomplete(): UsePlacesAutocompleteResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LiteAPIPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [debouncedQuery] = useDebounce(query, 300);
  const searchPlaces = useAction(api.places.search);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    searchPlaces({ query: debouncedQuery, type: 'locality' })
      .then((places) => {
        if (cancelled) return;
        setResults(places);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setResults([]);
        setLoading(false);
        setError(err?.message ?? 'Something went wrong searching for places.');
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, searchPlaces]);

  return { query, setQuery, results, loading, error, clearResults };
}
