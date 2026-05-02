import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';

import { Text } from '@/components';
import EventCard from '@/components/home/EventCard';
import { Colors, textStyles } from '@/constants';
import { Event } from '@/types/content.types';
import { api } from '@runwae/convex/convex/_generated/api';

export default function MyEventsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const registrations = useQuery(api.events.myEvents, {}) ?? [];
  const loading = registrations === undefined;

  function isoDateOnly(ms: number) {
    return new Date(ms).toISOString().slice(0, 10);
  }
  function isoTime(ms: number) {
    const d = new Date(ms);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(
      d.getUTCMinutes(),
    ).padStart(2, '0')}`;
  }
  function toEvent(e: any): Event {
    return {
      id: e._id as unknown as string,
      title: e.name,
      location: e.locationName,
      date: isoDateOnly(e.startDateUtc),
      time: isoTime(e.startDateUtc),
      category: e.category ?? 'event',
      image: e.imageUrl ?? e.imageUrls?.[0] ?? '',
      latitude: e.locationCoords?.lat ?? 0,
      longitude: e.locationCoords?.lng ?? 0,
      description: e.description,
    };
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundColors.default }}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.textColors.default} />
        </Pressable>
        <Text style={styles.headerTitle}>My Events</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#FF1F8C" />
        </View>
      ) : registrations.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}>
          <Calendar size={48} color="#D1D5DB" />
          <Text
            style={[styles.emptyTitle, { color: colors.textColors.default }]}>
            No events yet
          </Text>
          <Text style={[styles.emptySub, { color: colors.textColors.subtle }]}>
            Events you register for will appear here.
          </Text>
        </View>
      ) : (
        <FlashList
          data={registrations}
          keyExtractor={(i) => i._id as unknown as string}
          numColumns={2}
          contentContainerStyle={{ padding: 10 }}
          renderItem={({ item, index }) => (
            <View style={{ flex: 1, padding: 6 }}>
              <EventCard event={toEvent(item.event)} index={index} fullWidth />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyles.bold_20,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumb: { width: 80, height: 80 },
  info: { flex: 1, padding: 12, gap: 4, justifyContent: 'center' },
  eventTitle: { ...textStyles.bold_20, fontSize: 14 },
  eventMeta: { fontSize: 12 },
  emptyTitle: { ...textStyles.bold_20, fontSize: 18, marginTop: 16 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 8 },
});
