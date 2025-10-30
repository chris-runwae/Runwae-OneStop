import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl: string = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabasePublishableKey: string = process.env.EXPO_PUBLIC_SUPABASE_KEY || ''

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

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
}