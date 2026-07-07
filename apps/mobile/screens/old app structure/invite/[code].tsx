import { router, useLocalSearchParams } from 'expo-router';
import { Users } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';

import { Text } from '@/components';
import { Colors, textStyles } from '@/constants';
import { useTrips } from '@/context/TripsContext';
import { api } from '@runwae/convex/convex/_generated/api';

export default function InviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { joinTrip } = useTrips();

  const trip = useQuery(
    api.trips.getInvitePreview,
    code ? { joinCode: code } : 'skip',
  );
  const loading = code !== undefined && trip === undefined;

  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!code) return;
    setJoining(true);
    try {
      const tripId = await joinTrip(code);
      router.replace(`/(tabs)/(trips)/${tripId}` as any);
    } catch (err) {
      const msg = (err as Error).message;
      Alert.alert('Could not join', msg);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: colors.backgroundColors.default },
        ]}>
        <ActivityIndicator color="#FF1F8C" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor: colors.backgroundColors.default,
            paddingTop: insets.top,
          },
        ]}>
        <Text style={styles.errorTitle}>Invalid Invite</Text>
        <Text style={[styles.sub, { color: colors.textColors.subtle }]}>
          This invite link is invalid or has expired.
        </Text>
        <Pressable style={styles.btn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.btnText}>Go Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundColors.default,
          paddingTop: insets.top + 24,
        },
      ]}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Users size={32} color="#FF1F8C" />
        </View>
        <Text style={styles.eyebrow}>You've been invited to join</Text>
        <Text style={styles.tripName}>{trip.title}</Text>
        <Text style={[styles.sub, { color: colors.textColors.subtle }]}>
          {trip.memberCount} {trip.memberCount === 1 ? 'member' : 'members'}
        </Text>

        <Pressable
          style={[styles.btn, joining && { opacity: 0.7 }]}
          onPress={handleJoin}
          disabled={joining}>
          {joining ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Join Trip</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.cancelBtn}
          onPress={() => router.replace('/(tabs)')}>
          <Text style={[styles.cancelText, { color: colors.textColors.subtle }]}>
            Maybe later
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  container: { flex: 1, padding: 24, alignItems: 'center' },
  card: { alignItems: 'center', gap: 10, maxWidth: 320 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF1F8C15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  eyebrow: { fontSize: 14, color: '#9CA3AF' },
  tripName: { ...textStyles.bold_20, fontSize: 26, textAlign: 'center' },
  sub: { fontSize: 13, textAlign: 'center' },
  errorTitle: { ...textStyles.bold_20, fontSize: 20, marginBottom: 8 },
  btn: {
    backgroundColor: '#FF1F8C',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginTop: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { marginTop: 10, padding: 8 },
  cancelText: { fontSize: 14 },
});
