// lib/SupabaseProvider.tsx
// =====================================================
// Supabase Provider with Clerk Authentication
// Provides authenticated Supabase client throughout app
// =====================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

interface SupabaseContextValue {
  supabase: SupabaseClient | null;
  isReady: boolean;
}

const SupabaseContext = createContext<SupabaseContextValue>({
  supabase: null,
  isReady: false,
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initSupabase() {
      if (!isSignedIn) {
        setSupabase(null);
        setIsReady(false);
        return;
      }

      try {
        const token = await getToken({ template: 'supabase' });
        
        if (!token) {
          console.error('No Clerk token available');
          setSupabase(null);
          setIsReady(false);
          return;
        }

        const client = createClient(supabaseUrl, supabasePublishableKey, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          auth: {
            persistSession: false, // Clerk handles auth
          },
        });

        setSupabase(client);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        setSupabase(null);
        setIsReady(false);
      }
    }

    initSupabase();

    // Refresh client when auth state changes
    const interval = setInterval(() => {
      if (isSignedIn) {
        initSupabase();
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes (before token expires)

    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  return (
    <SupabaseContext.Provider value={{ supabase, isReady }}>
      {children}
    </SupabaseContext.Provider>
  );
}

/**
 * Hook to get authenticated Supabase client
 * @returns Supabase client with Clerk token
 * @throws Error if used outside SupabaseProvider
 */
export function useSupabase() {
  const context = useContext(SupabaseContext);
  
  if (context === undefined) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }

  return context;
}