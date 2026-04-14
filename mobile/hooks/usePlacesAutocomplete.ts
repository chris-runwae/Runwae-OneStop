import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

export interface LiteAPIPlace {
  placeId:          string;
  displayName:      string;
  formattedAddress: string;
  types:            string[];
}

interface UsePlacesAutocompleteResult {
  query:        string;
  setQuery:     (q: string) => void;
  results:      LiteAPIPlace[];
  loading:      boolean;
  error:        string | null;
  clearResults: () => void;
}

export function usePlacesAutocomplete(): UsePlacesAutocompleteResult {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<LiteAPIPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const [debouncedQuery] = useDebounce(query, 300);
  const abortRef = useRef<AbortController | null>(null);

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

    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const apiKey = process.env.EXPO_PUBLIC_LITE_API_KEY ?? process.env.LITE_API_KEY ?? '';
    const baseUrl = process.env.EXPO_PUBLIC_LITE_API_URL ?? 'https://api.liteapi.travel/v3.0';
    const url = `${baseUrl}/data/places?textQuery=${encodeURIComponent(debouncedQuery)}&type=locality`;

    setLoading(true);
    setError(null);

    fetch(url, {
      headers: { 'X-API-Key': apiKey },
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Search failed (${res.status})`);
        }
        return res.json();
      })
      .then((json) => {
        const raw: any[] = json?.data ?? [];
        const places: LiteAPIPlace[] = raw.map((item) => ({
          placeId:          item.placeId          ?? item.place_id          ?? '',
          displayName:      item.displayName?.text ?? item.displayName      ?? item.name ?? '',
          formattedAddress: item.formattedAddress  ?? item.formatted_address ?? '',
          types:            item.types             ?? [],
        }));
        setResults(places);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setResults([]);
        setLoading(false);
        setError(err?.message ?? 'Something went wrong searching for places.');
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  return { query, setQuery, results, loading, error, clearResults };
}
