import { useEffect } from 'react';
import { ActivityIndicator, View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

import { Text } from '@/components';
import { getSupabaseClient } from '@/lib/supabase';

export default function AutoJoinTrip() {
  const { getToken } = useAuth();
  const { tripId, code } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    async function join() {
      // 1. Validate trip + code
      const supabase = await getSupabaseClient(getToken);
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('id, join_code')
        .eq('id', tripId)
        .single();

      if (tripError || !trip) {
        Alert.alert('Error', 'Trip not found.');
        router.replace('/trips');
        return;
      }

      if (trip.join_code !== code) {
        Alert.alert('Invalid link', 'Join code does not match this trip.');
        router.replace('/trips');
        return;
      }

      // 2. Insert attendee (ignore duplicate)
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const { error: joinError } = await supabase
        .from('trip_attendees')
        .insert({ trip_id: tripId, user_id: userId })
        .select()
        .single(); // ignore duplicate

      if (joinError && joinError.code !== '23505') {
        Alert.alert('Error', 'Could not join trip.');
        router.replace('/trips');
        return;
      }

      // 3. Redirect
      router.replace(`/trips/${tripId}`);
    }

    join();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 12, fontSize: 16 }}>Joining trip…</Text>
    </View>
  );
}
