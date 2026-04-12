// hooks/useDestinations.ts
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client'; // adjust to your supabase client path

export type Destination = {
  id: string;
  title: string;
  location: string;
  country: string | null;
  image: string | null;
  rating: number | null;
  review_count: number;
  description: string | null;
  featured: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

type UseDestinationsOptions = {
  featuredOnly?: boolean;
  limit?: number;
  search?: string;
};

type UseDestinationsReturn = {
  destinations: Destination[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useDestinations(
  options: UseDestinationsOptions = {}
): UseDestinationsReturn {
  const { featuredOnly = false, limit = 20, search } = options;

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('destinations')
        .select('*')
        .order('featured', { ascending: false })
        .order('rating', { ascending: false })
        .limit(limit);

      if (featuredOnly) {
        query = query.eq('featured', true);
      }

      if (search && search.trim().length > 0) {
        query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      setDestinations(data ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [featuredOnly, limit, search]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  return { destinations, loading, error, refetch: fetchDestinations };
}

type UseDestinationByIdReturn = {
  destination: Destination | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useDestinationById(
  id: string | null
): UseDestinationByIdReturn {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDestination = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', id)
        .single();

      if (supabaseError) throw supabaseError;

      setDestination(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setDestination(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDestination();
  }, [fetchDestination]);

  return { destination, loading, error, refetch: fetchDestination };
}
