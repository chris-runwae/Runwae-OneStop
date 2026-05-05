import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ImageIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import { Text } from '@/components';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { AppFonts, Colors } from '@/constants';
import { ItemType, ItineraryItem } from '@/hooks/useItineraryActions';
import { supabase } from '@/utils/supabase/client';

const TYPE_EMOJI: Record<ItemType, string> = {
  flight: '✈️', hotel: '🏨', activity: '🏝', restaurant: '🍽',
  transport: '🚗', cruise: '🚢', event: '🎫', other: '📌',
};
const TYPE_LABEL: Record<ItemType, string> = {
  flight: 'Flight', hotel: 'Stay', activity: 'Activity', restaurant: 'Dine',
  transport: 'Transport', cruise: 'Cruise', event: 'Event', other: 'Other',
};

export default function ItineraryItemDetail() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const dark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  const [item, setItem] = useState<ItineraryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('id', itemId)
        .single();
      if (error) console.warn('[ItineraryItemDetail] fetch failed:', error.message);
      setItem(data ?? null);
      setLoading(false);
    })();
  }, [itemId]);

  return (
    <AppSafeAreaView edges={['top']} style={{ backgroundColor: colors.backgroundColors.default, flex: 1 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.textColors.default} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textColors.default }]}>
          {item?.title ?? 'Item Detail'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#FF1F8C" />
        </View>
      ) : !item ? (
        <View style={styles.centered}>
          <Text style={{ color: colors.textColors.subtle }}>Item not found.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.hero} contentFit="cover" />
          ) : (
            <View style={[styles.heroPlaceholder, { backgroundColor: dark ? '#1F1F1F' : '#F5F5F5' }]}>
              <ImageIcon size={40} color={dark ? '#4B5563' : '#D0D0D0'} />
            </View>
          )}

          <View style={styles.section}>
            <View style={[styles.badge, { borderColor: dark ? '#374151' : '#E9ECEF' }]}>
              <Text style={styles.badgeEmoji}>{TYPE_EMOJI[item.type] ?? '📌'}</Text>
              <Text style={[styles.badgeLabel, { color: colors.textColors.default }]}>
                {TYPE_LABEL[item.type] ?? 'Other'}
              </Text>
            </View>

            <Text style={[styles.title, { color: colors.textColors.default }]}>{item.title}</Text>

            {item.location ? (
              <Text style={[styles.meta, { color: colors.textColors.subtle }]}>📍 {item.location}</Text>
            ) : null}

            {item.start_time ? (
              <Text style={[styles.meta, { color: colors.textColors.subtle }]}>
                🕐 {item.start_time}{item.end_time ? ` – ${item.end_time}` : ''}
              </Text>
            ) : null}

            {item.cost != null ? (
              <Text style={[styles.meta, { color: colors.textColors.subtle }]}>
                💰 {item.currency} {item.cost}
              </Text>
            ) : null}
          </View>

          {item.notes ? (
            <View style={[styles.notesCard, { backgroundColor: dark ? '#1A1A1A' : '#F9F9F9', borderColor: dark ? '#333' : '#F0F0F0' }]}>
              <Text style={[styles.notesLabel, { color: colors.textColors.subtle }]}>Notes</Text>
              <Text style={[styles.notesText, { color: colors.textColors.default }]}>{item.notes}</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontFamily: AppFonts.bricolage.semiBold },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { width: '100%', height: 220 },
  heroPlaceholder: { width: '100%', height: 220, alignItems: 'center', justifyContent: 'center' },
  body: { paddingBottom: 40 },
  section: { padding: 20, gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, marginBottom: 4 },
  badgeEmoji: { fontSize: 13 },
  badgeLabel: { fontSize: 11, fontFamily: AppFonts.inter.medium },
  title: { fontSize: 22, fontFamily: AppFonts.bricolage.semiBold },
  meta: { fontSize: 13, fontFamily: AppFonts.inter.regular },
  notesCard: { marginHorizontal: 16, padding: 16, borderRadius: 12, borderWidth: 1, gap: 6 },
  notesLabel: { fontSize: 11, fontFamily: AppFonts.inter.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  notesText: { fontSize: 14, fontFamily: AppFonts.inter.regular, lineHeight: 20 },
});
