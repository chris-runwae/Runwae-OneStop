import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Button, Alert } from 'react-native';

import { Spacer, Text, TextInput } from '@/components';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-expo';

export default function JoinTripEnterCode() {
  const { tripId } = useLocalSearchParams();
  const { getToken } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');

  async function handleJoin() {
    if (!code.trim()) return;
    const supabase = await getSupabaseClient(getToken);

    // 1. Verify
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, join_code')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      Alert.alert('Error', 'Trip not found.');
      return;
    }

    if (trip.join_code !== code.trim()) {
      Alert.alert('Invalid code', 'Please check the join code.');
      return;
    }

    // 2. Insert attendee (ignore duplicates)
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { error: joinError } = await supabase
      .from('trip_attendees')
      .insert({ trip_id: tripId, user_id: userId })
      .select()
      .single();

    if (joinError && joinError.code !== '23505') {
      Alert.alert('Error', "Couldn't join trip.");
      return;
    }

    // 3. Navigate to trip
    router.replace(`/trips/${tripId}`);
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, marginBottom: 12 }}>Join Trip</Text>

      <TextInput
        placeholder="Enter join code"
        value={code}
        onChangeText={setCode}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}
      />

      <Button title="Join Trip" onPress={handleJoin} />
    </View>
  );
}
