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
  clearResults: () => void;
}

export function usePlacesAutocomplete(): UsePlacesAutocompleteResult {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<LiteAPIPlace[]>([]);
  const [loading, setLoading] = useState(false);

  const [debouncedQuery] = useDebounce(query, 300);
  const abortRef = useRef<AbortController | null>(null);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const apiKey = process.env.EXPO_PUBLIC_LITEAPI_KEY ?? '';
    const url = `https://api.liteapi.travel/v3.0/data/places?textQuery=${encodeURIComponent(debouncedQuery)}&type=locality`;

    setLoading(true);

    fetch(url, {
      headers: { 'X-API-Key': apiKey },
      signal: controller.signal,
    })
      .then((res) => res.json())
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
        if (err?.name !== 'AbortError') {
          setResults([]);
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  return { query, setQuery, results, loading, clearResults };
}
