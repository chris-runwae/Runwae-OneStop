import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabasePublishableKey: string =
  process.env.EXPO_PUBLIC_SUPABASE_KEY || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const getSupabaseClient = async (
  getToken: (options?: { template?: string }) => Promise<string | null>
) => {
  const token = await getToken({ template: 'supabase' });
  if (!token) {
    throw new Error('Authentication token unavailable');
  }

  const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  return supabase;
};

export const createClerkSupabaseClient = (
  getToken: () => Promise<string | null>
) => {
  return createClient(supabaseUrl, supabasePublishableKey, {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await getToken();

        const headers = new Headers(options?.headers);
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`);
        }

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });
};
