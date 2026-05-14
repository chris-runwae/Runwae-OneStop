import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ImageIcon, MoreHorizontal, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { useMutation, useQuery } from 'convex/react';

import { Text } from '@/components';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { AppFonts, Colors } from '@/constants';
import type { ItemType } from '@/hooks/useItineraryActions';
import ActionMenu, { type ActionOption } from '@/components/common/ActionMenu';
import LocationMapPreview from '@/components/event/LocationMapPreview';
import EditItineraryItemSheet from '@/components/trip-activity/EditItineraryItemSheet';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';

const TYPE_EMOJI: Record<ItemType, string> = {
  flight: '✈️',
  hotel: '🏨',
  tour: '🚢',
  car_rental: '🚙',
  activity: '🏝',
  restaurant: '🍽',
  transport: '🚗',
  event: '🎫',
  other: '📌',
};
const TYPE_LABEL: Record<ItemType, string> = {
  flight: 'Flight',
  hotel: 'Stay',
  tour: 'Tour',
  car_rental: 'Car',
  activity: 'Activity',
  restaurant: 'Dine',
  transport: 'Transport',
  event: 'Event',
  other: 'Other',
};

// Items with these types can land in the experiences search surface
// when the user wants to find a real booking for an AI-generated entry.
// Hotels go to their own search screen; flights stay free-form for now.
const BOOKING_CATEGORY: Partial<Record<ItemType, 'tour' | 'eat' | 'event'>> = {
  tour: 'tour',
  activity: 'tour',
  other: 'tour',
  restaurant: 'eat',
  event: 'event',
};

const BOOKING_VERB: Partial<Record<ItemType, string>> = {
  tour: 'tour',
  activity: 'activity',
  other: 'thing to do',
  restaurant: 'place to eat',
  event: 'event ticket',
};

export default function ItineraryItemDetail() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const dark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  const data = useQuery(
    api.itinerary.getItem,
    itemId ? { itemId: itemId as Id<'itinerary_items'> } : 'skip',
  );
  const deleteItem = useMutation(api.itinerary.deleteItem);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = () => {
    if (!data?.item) return;
    Alert.alert(
      'Delete item?',
      `"${data.item.title}" will be removed from this trip.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem({ itemId: data.item._id });
              router.back();
            } catch (err) {
              Alert.alert(
                'Couldn’t delete',
                err instanceof Error ? err.message : 'Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const handleFindBooking = () => {
    if (!data?.item) return;
    const item = data.item;
    if (item.type === 'hotel') {
      router.push({
        pathname: '/hotels-search/results',
        params: {
          destination: item.locationName ?? data.tripDestination,
          checkin: data.tripStartDate,
          checkout: data.tripEndDate,
          adults: '2',
          rooms: '1',
        },
      });
      return;
    }
    const category = BOOKING_CATEGORY[item.type];
    if (!category) return;
    const term = item.locationName ?? item.title;
    router.push({
      pathname: '/experiences-search/results',
      params: { term, category },
    });
  };

  const menuOptions: ActionOption[] = data?.item
    ? [
        { label: 'Edit', onPress: () => setEditOpen(true) },
        {
          label: 'Delete',
          isDestructive: true,
          onPress: handleDelete,
          hasSeparator: true,
        },
      ]
    : [];

  return (
    <AppSafeAreaView
      edges={['top']}
      style={{ backgroundColor: colors.backgroundColors.default, flex: 1 }}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.textColors.default} />
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: colors.textColors.default }]}>
          Item Detail
        </Text>
        <View style={{ flex: 1 }} />
        {data?.item ? (
          <Pressable
            onPress={() => setMenuOpen(true)}
            hitSlop={10}
            accessibilityLabel="More options"
            style={styles.kebabBtn}>
            <MoreHorizontal size={22} color={colors.textColors.default} />
          </Pressable>
        ) : null}
      </View>

      {data === undefined ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#FF1F8C" />
        </View>
      ) : !data ? (
        <View style={styles.centered}>
          <Text style={{ color: colors.textColors.subtle }}>
            Item not found.
          </Text>
        </View>
      ) : (
        <ItemBody
          data={data}
          dark={dark}
          colors={colors}
          onFindBooking={handleFindBooking}
        />
      )}

      <ActionMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        options={menuOptions}
      />

      <EditItineraryItemSheet
        visible={editOpen}
        item={data?.item ?? null}
        onClose={() => setEditOpen(false)}
      />
    </AppSafeAreaView>
  );
}

function ItemBody({
  data,
  dark,
  colors,
  onFindBooking,
}: {
  data: NonNullable<ReturnType<typeof useQuery<typeof api.itinerary.getItem>>>;
  dark: boolean;
  colors: typeof Colors.light;
  onFindBooking: () => void;
}) {
  const item = data.item;
  const bookingCategory = BOOKING_CATEGORY[item.type];
  const showFindBooking =
    !item.apiSource &&
    (item.type === 'hotel' || bookingCategory !== undefined);
  const mapTarget = item.locationName ?? null;

  return (
    <ScrollView contentContainerStyle={styles.body}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.hero}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.heroPlaceholder,
            { backgroundColor: dark ? '#1F1F1F' : '#F5F5F5' },
          ]}>
          <ImageIcon size={40} color={dark ? '#4B5563' : '#D0D0D0'} />
        </View>
      )}

      <View style={styles.section}>
        <View
          style={[
            styles.badge,
            { borderColor: dark ? '#374151' : '#E9ECEF' },
          ]}>
          <Text style={styles.badgeEmoji}>
            {TYPE_EMOJI[item.type] ?? '📌'}
          </Text>
          <Text
            style={[styles.badgeLabel, { color: colors.textColors.default }]}>
            {TYPE_LABEL[item.type] ?? 'Other'}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.textColors.default }]}>
          {item.title}
        </Text>

        {item.locationName ? (
          <Text style={[styles.meta, { color: colors.textColors.subtle }]}>
            📍 {item.locationName}
          </Text>
        ) : null}

        {item.startTime ? (
          <Text style={[styles.meta, { color: colors.textColors.subtle }]}>
            🕐 {item.startTime}
            {item.endTime ? ` – ${item.endTime}` : ''}
          </Text>
        ) : null}

        {item.price != null ? (
          <Text style={[styles.meta, { color: colors.textColors.subtle }]}>
            💰 {item.currency ?? ''} {item.price}
          </Text>
        ) : null}
      </View>

      {mapTarget ? (
        <View style={styles.mapWrap}>
          <LocationMapPreview location={mapTarget} height={180} />
        </View>
      ) : null}

      {showFindBooking ? (
        <View style={styles.bookingWrap}>
          <Pressable
            onPress={onFindBooking}
            style={({ pressed }) => [
              styles.bookingBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}>
            <Search size={15} color="#fff" />
            <Text style={styles.bookingBtnText}>
              Find a {BOOKING_VERB[item.type] ?? 'place'} to book
            </Text>
          </Pressable>
        </View>
      ) : null}

      {item.notes ? (
        <View
          style={[
            styles.notesCard,
            {
              backgroundColor: dark ? '#1A1A1A' : '#F9F9F9',
              borderColor: dark ? '#333' : '#F0F0F0',
            },
          ]}>
          <Text style={[styles.notesLabel, { color: colors.textColors.subtle }]}>
            Notes
          </Text>
          <Text
            style={[styles.notesText, { color: colors.textColors.default }]}>
            {item.notes}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: { padding: 4 },
  kebabBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontFamily: AppFonts.bricolage.semiBold },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { width: '100%', height: 220 },
  heroPlaceholder: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingBottom: 40 },
  section: { padding: 20, gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    marginBottom: 4,
  },
  badgeEmoji: { fontSize: 13 },
  badgeLabel: { fontSize: 11, fontFamily: AppFonts.inter.medium },
  title: { fontSize: 22, fontFamily: AppFonts.bricolage.semiBold },
  meta: { fontSize: 13, fontFamily: AppFonts.inter.regular },
  mapWrap: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookingWrap: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF1F8C',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  bookingBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: AppFonts.inter.semiBold,
  },
  notesCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  notesLabel: {
    fontSize: 11,
    fontFamily: AppFonts.inter.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 14,
    fontFamily: AppFonts.inter.regular,
    lineHeight: 20,
  },
});
