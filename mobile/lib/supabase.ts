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