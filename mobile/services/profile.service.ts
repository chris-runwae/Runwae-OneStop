import { SupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  username?: string;
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const fetchUserProfile = async (
  supabaseClient: SupabaseClient,
  clerkUserId: string
): Promise<UserProfile | null> => {
  try {
    console.log('[Profile Service] Fetching user profile for:', clerkUserId);
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error) {
      console.error('[Profile Service] Error fetching profile:', error);
      return null;
    }

    console.log('[Profile Service] Profile fetched:', data);
    return data as UserProfile;
  } catch (error) {
    console.error('[Profile Service] Unexpected error:', error);
    return null;
  }
};

export const upsertUserProfile = async (
  supabaseClient: SupabaseClient,
  profile: Partial<UserProfile> & { clerk_user_id: string }
): Promise<UserProfile | null> => {
  try {
    console.log('[Profile Service] Upserting user profile:', profile);
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
      console.error('[Profile Service] Error upserting profile:', error);
      return null;
    }

    console.log('[Profile Service] Profile upserted:', data);
    return data as UserProfile;
  } catch (error) {
    console.error('[Profile Service] Unexpected error:', error);
    return null;
  }
};

export const deleteUserProfile = async (
  supabaseClient: SupabaseClient,
  clerkUserId: string
): Promise<boolean> => {
  try {
    console.log('[Profile Service] Deleting user profile for:', clerkUserId);
    const { error } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('clerk_user_id', clerkUserId);

    if (error) {
      console.error('[Profile Service] Error deleting profile:', error);
      return false;
    }

    console.log('[Profile Service] Profile deleted');
    return true;
  } catch (error) {
    console.error('[Profile Service] Unexpected error:', error);
    return false;
  }
};
