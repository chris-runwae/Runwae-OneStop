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

export interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const fetchUserProfile = async (
  supabaseClient: SupabaseClient,
  clerkUserId: string
): Promise<UserProfile | null> => {
  try {
    console.log('[Supabase] Fetching user profile for:', clerkUserId);
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error) {
      console.error('[Supabase] Error fetching profile:', error);
      return null;
    }

    console.log('[Supabase] Profile fetched:', data);
    return data as UserProfile;
  } catch (error) {
    console.error('[Supabase] Unexpected error:', error);
    return null;
  }
};

export const upsertUserProfile = async (
  supabaseClient: SupabaseClient,
  profile: Partial<UserProfile> & { clerk_user_id: string }
): Promise<UserProfile | null> => {
  try {
    console.log('[Supabase] Upserting user profile:', profile);
    const profileData = {
      ...profile,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseClient
      .from('profiles')
      .upsert(profileData, { onConflict: 'clerk_user_id' })
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error upserting profile:', error);
      return null;
    }

    console.log('[Supabase] Profile upserted:', data);
    return data as UserProfile;
  } catch (error) {
    console.error('[Supabase] Unexpected error:', error);
    return null;
  }
};

export const deleteUserProfile = async (
  supabaseClient: SupabaseClient,
  clerkUserId: string
): Promise<boolean> => {
  try {
    console.log('[Supabase] Deleting user profile for:', clerkUserId);
    const { error } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('clerk_user_id', clerkUserId);

    if (error) {
      console.error('[Supabase] Error deleting profile:', error);
      return false;
    }

    console.log('[Supabase] Profile deleted');
    return true;
  } catch (error) {
    console.error('[Supabase] Unexpected error:', error);
    return false;
  }
};
