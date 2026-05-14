import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ImageIcon,
  MapPin,
  MoreHorizontal,
  Search,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import LocationMap from '@/components/event/LocationMap';
import EditItineraryItemSheet from '@/components/trip-activity/EditItineraryItemSheet';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 320;

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
    <View style={{ flex: 1, backgroundColor: colors.backgroundColors.default }}>
      {data === undefined ? (
        <AppSafeAreaView edges={['top']} style={{ flex: 1 }}>
          <FloatingBack onPress={() => router.back()} dark={dark} />
          <View style={styles.centered}>
            <ActivityIndicator color="#FF1F8C" />
          </View>
        </AppSafeAreaView>
      ) : !data ? (
        <AppSafeAreaView edges={['top']} style={{ flex: 1 }}>
          <FloatingBack onPress={() => router.back()} dark={dark} />
          <View style={styles.centered}>
            <Text style={{ color: colors.textColors.subtle }}>
              Item not found.
            </Text>
          </View>
        </AppSafeAreaView>
      ) : (
        <ItemBody
          data={data}
          dark={dark}
          colors={colors}
          onBack={() => router.back()}
          onMenu={() => setMenuOpen(true)}
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
    </View>
  );
}

function FloatingBack({
  onPress,
  dark,
}: {
  onPress: () => void;
  dark: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={[
        styles.floatingBtn,
        {
          backgroundColor: dark
            ? 'rgba(20,20,20,0.7)'
            : 'rgba(255,255,255,0.85)',
        },
      ]}>
      <ArrowLeft size={20} color={dark ? '#fff' : '#111'} />
    </Pressable>
  );
}

function ItemBody({
  data,
  dark,
  colors,
  onBack,
  onMenu,
  onFindBooking,
}: {
  data: NonNullable<ReturnType<typeof useQuery<typeof api.itinerary.getItem>>>;
  dark: boolean;
  colors: typeof Colors.light;
  onBack: () => void;
  onMenu: () => void;
  onFindBooking: () => void;
}) {
  const item = data.item;
  const bookingCategory = BOOKING_CATEGORY[item.type];
  const showFindBooking =
    !item.apiSource &&
    (item.type === 'hotel' || bookingCategory !== undefined);
  const mapTarget = item.locationName ?? null;
  const lat = item.coords?.lat;
  const lng = item.coords?.lng;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}>
      {/* Hero — image (or gradient placeholder) with overlaid chrome */}
      <View style={[styles.hero, { height: HERO_HEIGHT }]}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: dark ? '#1F1F1F' : '#F5F5F5',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}>
            <ImageIcon size={48} color={dark ? '#4B5563' : '#D0D0D0'} />
          </View>
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <AppSafeAreaView edges={['top']} style={styles.heroChrome}>
          <View style={styles.heroChromeRow}>
            <Pressable
              onPress={onBack}
              hitSlop={12}
              style={styles.glassBtn}>
              <ArrowLeft size={20} color="#fff" />
            </Pressable>
            <Pressable
              onPress={onMenu}
              hitSlop={12}
              style={styles.glassBtn}
              accessibilityLabel="More options">
              <MoreHorizontal size={20} color="#fff" />
            </Pressable>
          </View>
        </AppSafeAreaView>

        <View style={styles.heroBottom} pointerEvents="none">
          <View style={styles.pill}>
            <Text style={styles.pillEmoji}>
              {TYPE_EMOJI[item.type] ?? '📌'}
            </Text>
            <Text style={styles.pillLabel}>
              {TYPE_LABEL[item.type] ?? 'Other'}
            </Text>
          </View>
          <Text style={styles.heroTitle} numberOfLines={3}>
            {item.title}
          </Text>
        </View>
      </View>

      {/* Meta */}
      <View style={styles.section}>
        {item.locationName ? (
          <View style={styles.metaRow}>
            <MapPin
              size={14}
              color={colors.textColors.subtle}
              strokeWidth={2}
            />
            <Text
              style={[styles.meta, { color: colors.textColors.subtle }]}
              numberOfLines={2}>
              {item.locationName}
            </Text>
          </View>
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

      {/* Native map preview */}
      {mapTarget ? (
        <View
          style={[
            styles.mapWrap,
            { backgroundColor: dark ? '#1A1A1A' : '#F3F4F6' },
          ]}>
          <LocationMap
            location={mapTarget}
            eventTitle={item.title}
            latitude={lat}
            longitude={lng}
            style={{ width: '100%', height: 180 }}
          />
        </View>
      ) : null}

      {/* Find a booking */}
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

      {/* Notes */}
      {item.notes ? (
        <View
          style={[
            styles.notesCard,
            {
              backgroundColor: dark ? '#1A1A1A' : '#F9F9F9',
              borderColor: dark ? '#333' : '#F0F0F0',
            },
          ]}>
          <Text
            style={[styles.notesLabel, { color: colors.textColors.subtle }]}>
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  floatingBtn: {
    position: 'absolute',
    top: 56,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  body: { paddingBottom: 48 },

  hero: {
    width: SCREEN_WIDTH,
    backgroundColor: '#111',
    position: 'relative',
  },
  heroChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  heroChromeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  glassBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroBottom: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 22,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  pillEmoji: { fontSize: 12 },
  pillLabel: {
    fontSize: 11,
    fontFamily: AppFonts.inter.semiBold,
    color: '#111',
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontFamily: AppFonts.bricolage.semiBold,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },

  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    fontSize: 14,
    fontFamily: AppFonts.inter.regular,
    flexShrink: 1,
  },

  mapWrap: {
    marginTop: 18,
    marginHorizontal: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },

  bookingWrap: {
    marginTop: 18,
    marginHorizontal: 20,
  },
  bookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF1F8C',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  bookingBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: AppFonts.inter.semiBold,
  },

  notesCard: {
    marginTop: 18,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 14,
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
