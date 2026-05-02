import { useEffect, useState } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Module-level cache — persists for the app session so identical location
// strings are never geocoded more than once, avoiding Nominatim rate limits.
const geocodeCache = new Map<string, Coordinates | null>();

async function geocodeLocation(location: string): Promise<Coordinates | null> {
  // Return cached result immediately if available
  if (geocodeCache.has(location)) {
    return geocodeCache.get(location) ?? null;
  }

  const encoded = encodeURIComponent(location);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&addressdetails=0`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'RunwaeApp/1.0 (contact@runwae.com)',
      },
    });

    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);

    const data = await res.json();

    if (data?.length > 0) {
      const coords: Coordinates = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
      geocodeCache.set(location, coords);
      return coords;
    }

    // Mark as failed so we don't retry endlessly
    geocodeCache.set(location, null);
    return null;
  } catch {
    // Don't cache errors — allow retry on next mount
    return null;
  }
}

/**
 * Geocodes a location string to coordinates using the free OpenStreetMap
 * Nominatim API (no API key required). Results are cached in memory for
 * the app session to avoid hitting Nominatim's rate limit.
 */
export function useGeocode(location: string) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(
    // Warm-start from cache if already available
    () => (geocodeCache.get(location) ?? null)
  );
  const [loading, setLoading] = useState<boolean>(
    () => !geocodeCache.has(location) && !!location
  );

  useEffect(() => {
    if (!location) return;

    // Already in cache — no need to fetch
    if (geocodeCache.has(location)) {
      setCoordinates(geocodeCache.get(location) ?? null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    geocodeLocation(location).then((coords) => {
      if (!cancelled) {
        setCoordinates(coords);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [location]);

  return { coordinates, loading };
}
