// hooks/useDestinations.ts
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client'; // adjust to your supabase client path

import { Destination } from '@/types/content.types';

function mapRow(row: any): Destination {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    country: row.country,
    image: row.image,
    rating: row.rating ? Number(row.rating) : undefined,
    reviewCount: row.review_count,
    description: row.description,
    featured: row.featured,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

      setDestinations((data ?? []).map(mapRow));
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

      setDestination(data ? mapRow(data) : null);
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
