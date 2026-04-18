import { router } from 'expo-router';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, useColorScheme, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components';
import { Colors, textStyles } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { getUserEventRegistrations, EventRegistration } from '@/utils/supabase/event-registrations.service';

export default function MyEventsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getUserEventRegistrations(user.id)
      .then((regs) => setRegistrations(regs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#FF1F8C" />
        </View>
      ) : registrations.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Calendar size={48} color="#D1D5DB" />
          <Text style={[styles.emptyTitle, { color: colors.textColors.default }]}>No events yet</Text>
          <Text style={[styles.emptySub, { color: colors.textColors.subtle }]}>
            Events you register for will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={registrations}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, { borderColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB' }]}
              onPress={() => router.push(`/events/${item.eventId}` as any)}>
              {item.event?.image ? (
                <Image source={{ uri: item.event.image }} style={styles.thumb} resizeMode="cover" />
              ) : null}
              <View style={styles.info}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {item.event?.title ?? 'Event'}
                </Text>
                {item.event?.date ? (
                  <Text style={[styles.eventMeta, { color: colors.textColors.subtle }]}>
                    {item.event.date}
                  </Text>
                ) : null}
                {item.event?.location ? (
                  <Text style={[styles.eventMeta, { color: colors.textColors.subtle }]} numberOfLines={1}>
                    {item.event.location}
                  </Text>
                ) : null}
                {item.amountPaid ? (
                  <Text style={[styles.eventMeta, { color: colors.textColors.subtle }]}>
                    Paid: {item.currency} {item.amountPaid}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...textStyles.bold_20, fontSize: 16, flex: 1, textAlign: 'center' },
  card: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  thumb: { width: 80, height: 80 },
  info: { flex: 1, padding: 12, gap: 4, justifyContent: 'center' },
  eventTitle: { ...textStyles.bold_20, fontSize: 14 },
  eventMeta: { fontSize: 12 },
  emptyTitle: { ...textStyles.bold_20, fontSize: 18, marginTop: 16 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 8 },
});
