import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  BedDouble,
  Calendar,
  Home,
  Maximize2,
  ShieldCheck,
  ShieldOff,
  Users,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacer, Text } from '@/components';
import { Colors, textStyles } from '@/constants';
import type { HotelDetail, HotelRoomDetail } from '@/types/hotel.types';
import type {
  LiteAPIHotelRoomRate,
  LiteAPIHotelRoomType,
} from '@/types/liteapi.types';
import { getCurrencySymbol } from '@/utils/currency';
import { ratePriceParts, roomGalleryForMappedRoom } from '@/utils/hotelRates';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function pluralAdults(n: number) {
  return n === 1 ? '1 adult' : `${n} adults`;
}

function pluralGuests(n: number) {
  return n === 1 ? '1 guest' : `${n} guests`;
}

function pluralChildren(n: number) {
  return n === 1 ? '1 child' : `${n} children`;
}

function formatRoomSize(size: number | string | undefined): string | null {
  if (size == null || size === '') return null;
  if (typeof size === 'number') return `${size} m²`;
  const s = String(size);
  return /\d/.test(s) && !/m²|sq|ft/i.test(s) ? `${s} m²` : s;
}

function parseRoomRouteParams(
  hotelJson: unknown,
  roomBundleJson: unknown,
  rateIdStr: string | undefined
): {
  hotel: HotelDetail;
  roomType: LiteAPIHotelRoomType;
  rate: LiteAPIHotelRoomRate;
} | null {
  try {
    if (hotelJson == null || roomBundleJson == null) return null;
    const hotel = JSON.parse(String(hotelJson)) as HotelDetail;
    const { roomType, rate } = JSON.parse(String(roomBundleJson)) as {
      roomType: LiteAPIHotelRoomType;
      rate: LiteAPIHotelRoomRate;
    };
    if (!rate?.rateId) return null;
    if (rateIdStr && rate.rateId !== rateIdStr) return null;
    return { hotel, roomType, rate };
  } catch {
    return null;
  }
}

export default function RoomDetailsScreen() {
  const {
    rateId,
    checkin = '',
    checkout = '',
    adults: adultsStr,
    tripId = '',
    hotelJson,
    roomBundleJson,
  } = useLocalSearchParams<{
    hotelId: string;
    rateId: string;
    checkin?: string;
    checkout?: string;
    adults?: string;
    tripId?: string;
    hotelJson?: string;
    roomBundleJson?: string;
  }>();

  const adults = parseInt(adultsStr ?? '1', 10);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [imageIndex, setImageIndex] = useState(0);

  const bundle = useMemo(
    () => parseRoomRouteParams(hotelJson, roomBundleJson, rateId),
    [hotelJson, roomBundleJson, rateId]
  );

  /** Match catalog room: id from rate, else same room name, else single room. */
  const roomMeta = useMemo((): HotelRoomDetail | null => {
    if (!bundle) return null;
    const { hotel, rate } = bundle;
    const rooms = hotel.rooms ?? [];
    if (rooms.length === 0) return null;

    if (rate.mappedRoomId != null) {
      const byId = rooms.find((r) => r.id === rate.mappedRoomId);
      if (byId) return byId;
    }

    const rateName = rate.name?.trim().toLowerCase();
    if (rateName) {
      const byName = rooms.find(
        (r) => r.roomName?.trim().toLowerCase() === rateName
      );
      if (byName) return byName;
      const partial = rooms.find(
        (r) =>
          r.roomName &&
          (rateName.includes(r.roomName.trim().toLowerCase()) ||
            r.roomName.trim().toLowerCase().includes(rateName))
      );
      if (partial) return partial;
    }

    if (rooms.length === 1) return rooms[0];
    return null;
  }, [bundle]);

  const galleryUrls = useMemo(() => {
    if (!bundle) return [];
    return roomGalleryForMappedRoom(bundle.hotel, bundle.rate.mappedRoomId);
  }, [bundle]);

  const price = bundle ? ratePriceParts(bundle.rate) : null;

  const fmt = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /** Booking still uses full `roomType` + `rate` from the bundle (params). */
  const handleBook = () => {
    if (!bundle || !price) return;
    const { hotel, roomType, rate } = bundle;
    router.push({
      pathname: '/hotel/book',
      params: {
        hotelId: hotel.hotelId,
        hotelName: hotel.name,
        hotelThumb: hotel.thumbnail,
        offerId: roomType.offerId,
        roomName: rate.name,
        boardName: rate.boardName,
        price: String(price.amount),
        currency: price.currency,
        checkin,
        checkout,
        adults: String(adults),
        tripId,
        rateId: rate.rateId,
      },
    } as any);
  };

  if (!bundle) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.backgroundColors.default },
        ]}>
        <Text style={{ color: colors.textColors.subtle, textAlign: 'center' }}>
          Room data is missing or expired. Go back to the hotel and open the
          room again.
        </Text>
        <Pressable style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const { hotel, rate } = bundle;
  const refundable = rate.cancellationPolicies?.refundableTag === 'RFN';

  const maxOcc = roomMeta?.maxOccupancy ?? rate.maxOccupancy;
  const maxAdultsRoom = roomMeta?.maxAdults;
  const maxChildrenRoom = roomMeta?.maxChildren;
  const roomDescription = roomMeta?.description?.trim() ?? '';
  const roomSizeLabel = formatRoomSize(roomMeta?.roomSquareSize);
  const roomAmenities = roomMeta?.amenities?.filter(Boolean) ?? [];
  const bedTypes = roomMeta?.bedTypes?.filter(Boolean) ?? [];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundColors.default },
      ]}>
      <View style={styles.hero}>
        <FlatList
          data={galleryUrls.length ? galleryUrls : ['']}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(
              e.nativeEvent.contentOffset.x / SCREEN_WIDTH
            );
            setImageIndex(idx);
          }}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item }) =>
            item ? (
              <Image
                source={{ uri: item }}
                style={{ width: SCREEN_WIDTH, height: 280 }}
                contentFit="cover"
              />
            ) : (
              <View
                style={{
                  width: SCREEN_WIDTH,
                  height: 280,
                  backgroundColor: '#374151',
                }}
              />
            )
          }
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'transparent']}
          style={styles.heroGradient}
        />
        <Pressable
          style={[styles.backBtn, { top: insets.top + 8 }]}
          onPress={() => router.back()}>
          <ArrowLeft size={20} color="#fff" />
        </Pressable>
        <View style={styles.dots}>
          {(galleryUrls.length ? galleryUrls : ['']).slice(0, 8).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === imageIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                  width: i === imageIndex ? 16 : 6,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={styles.content}>
          <Text style={[styles.hotelName, { color: colors.textColors.subtle }]}>
            {hotel.name}
          </Text>
          <Text
            style={[styles.roomTitle, { color: colors.textColors.default }]}
            maxFontSizeMultiplier={1.35}>
            {rate.name}
          </Text>
          {roomMeta?.roomName && roomMeta.roomName !== rate.name ? (
            <Text
              style={[
                styles.roomSubtitle,
                { color: colors.textColors.subtle },
              ]}>
              {roomMeta.roomName}
            </Text>
          ) : null}
          <Text
            style={[styles.boardLine, { color: colors.textColors.subtle }]}
            maxFontSizeMultiplier={1.35}>
            {rate.boardName}
          </Text>

          <Spacer size={14} vertical />

          <View style={styles.priceBlock}>
            <View style={styles.priceRowWrap}>
              <Text
                style={[styles.priceMain, { color: '#FF1F8C' }]}
                maxFontSizeMultiplier={1.25}>
                {price
                  ? `${getCurrencySymbol(price.currency)} ${price.amount.toFixed(0)}`
                  : '—'}
              </Text>
              <Text
                style={[
                  styles.priceSuffix,
                  { color: colors.textColors.subtle },
                ]}>
                / night
              </Text>
            </View>
          </View>

          <Spacer size={22} vertical />

          <View
            style={[
              styles.infoCard,
              {
                borderColor: colorScheme === 'dark' ? '#374151' : '#E9ECEF',
              },
            ]}>
            <View style={styles.infoRow}>
              <Calendar size={18} color="#FF1F8C" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Stay</Text>
                <Text style={styles.infoValue}>
                  {fmt(checkin)} → {fmt(checkout)}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Users size={18} color="#FF1F8C" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Your booking</Text>
                <Text style={styles.infoValue}>{pluralAdults(adults)}</Text>
              </View>
            </View>
          </View>

          <Spacer size={24} vertical />

          <Text
            style={[styles.sectionLabel, { color: colors.textColors.default }]}>
            About this room
          </Text>
          <Spacer size={8} vertical />
          <Text style={[styles.bodyText, { color: colors.textColors.subtle }]}>
            {roomDescription
              ? roomDescription
              : 'No room description is available for this hotel yet.'}
          </Text>

          <Spacer size={24} vertical />

          <Text
            style={[styles.sectionLabel, { color: colors.textColors.default }]}>
            Room size
          </Text>
          <Spacer size={8} vertical />
          <View style={styles.inlineRow}>
            <Maximize2 size={18} color="#FF1F8C" />
            <Text
              style={[styles.bodyText, { color: colors.textColors.default }]}>
              {roomSizeLabel ?? 'Size not listed'}
            </Text>
          </View>

          <Spacer size={24} vertical />

          <Text
            style={[styles.sectionLabel, { color: colors.textColors.default }]}>
            Capacity
          </Text>
          <Spacer size={10} vertical />
          <View
            style={[
              styles.capacityCard,
              {
                borderColor: colorScheme === 'dark' ? '#374151' : '#E9ECEF',
              },
            ]}>
            {maxOcc != null && maxOcc > 0 ? (
              <View style={styles.capacityRow}>
                <Users size={16} color="#FF1F8C" />
                <Text
                  style={[
                    styles.bodyText,
                    { color: colors.textColors.default },
                  ]}>
                  Up to {pluralGuests(maxOcc)}
                </Text>
              </View>
            ) : null}
            {maxAdultsRoom != null ? (
              <View style={styles.capacityRow}>
                <Text
                  style={[
                    styles.capacityBullet,
                    { color: colors.textColors.subtle },
                  ]}>
                  •
                </Text>
                <Text
                  style={[
                    styles.bodyText,
                    { color: colors.textColors.default },
                  ]}>
                  Up to {pluralAdults(maxAdultsRoom)} (room limit)
                </Text>
              </View>
            ) : null}
            {maxChildrenRoom != null ? (
              <View style={styles.capacityRow}>
                <Text
                  style={[
                    styles.capacityBullet,
                    { color: colors.textColors.subtle },
                  ]}>
                  •
                </Text>
                <Text
                  style={[
                    styles.bodyText,
                    { color: colors.textColors.default },
                  ]}>
                  Up to {pluralChildren(maxChildrenRoom)} (room limit)
                </Text>
              </View>
            ) : null}
            {(maxOcc == null || maxOcc <= 0) &&
            maxAdultsRoom == null &&
            maxChildrenRoom == null ? (
              <Text
                style={[styles.bodyText, { color: colors.textColors.subtle }]}>
                Capacity details for this room are not listed by the hotel.
              </Text>
            ) : null}
          </View>

          <Spacer size={24} vertical />

          <Text
            style={[styles.sectionLabel, { color: colors.textColors.default }]}>
            Bed types
          </Text>
          <Spacer size={10} vertical />
          {bedTypes.length > 0 ? (
            <View style={styles.amenityWrap}>
              {bedTypes.map((b, i) => (
                <View
                  key={`bed-${i}-${b}`}
                  style={[
                    styles.amenityChip,
                    {
                      borderColor:
                        colorScheme === 'dark' ? '#374151' : '#E9ECEF',
                      backgroundColor:
                        colorScheme === 'dark' ? '#1F2937' : '#FF1F8C08',
                    },
                  ]}>
                  <BedDouble size={12} color="#FF1F8C" />
                  <Text style={styles.amenityText}>{b}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text
              style={[styles.bodyText, { color: colors.textColors.subtle }]}>
              {roomMeta
                ? 'No bed type is listed for this room.'
                : 'Link this rate to a hotel room to see bed types.'}
            </Text>
          )}

          <Spacer size={24} vertical />

          <Text
            style={[styles.sectionLabel, { color: colors.textColors.default }]}>
            Room amenities
          </Text>
          <Spacer size={10} vertical />
          {roomAmenities.length > 0 ? (
            <View style={styles.amenityWrap}>
              {roomAmenities.map((a, i) => (
                <View
                  key={`${i}-${a}`}
                  style={[
                    styles.amenityChip,
                    {
                      borderColor:
                        colorScheme === 'dark' ? '#374151' : '#E9ECEF',
                      backgroundColor:
                        colorScheme === 'dark' ? '#1F2937' : '#FF1F8C08',
                    },
                  ]}>
                  <Home size={12} color="#FF1F8C" />
                  <Text style={styles.amenityText}>{a}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text
              style={[styles.bodyText, { color: colors.textColors.subtle }]}>
              {roomMeta
                ? 'No amenities list is available for this room.'
                : 'Link this rate to a hotel room to see amenities.'}
            </Text>
          )}

          <Spacer size={24} vertical />

          <Text
            style={[styles.sectionLabel, { color: colors.textColors.default }]}>
            Cancellation
          </Text>
          <Spacer size={8} vertical />
          <View style={styles.inlineRow}>
            {refundable ? (
              <ShieldCheck size={16} color="#22C55E" />
            ) : (
              <ShieldOff size={16} color="#EF4444" />
            )}
            <Text
              style={{
                color: refundable ? '#22C55E' : '#EF4444',
                fontSize: 14,
                flex: 1,
                lineHeight: 20,
              }}>
              {refundable
                ? 'Free cancellation may apply (see policy at checkout).'
                : 'This rate is non-refundable.'}
            </Text>
          </View>

          <Spacer size={32} vertical />
        </View>
      </ScrollView>

      <View
        style={[
          styles.cta,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: colors.backgroundColors.default,
            borderTopColor: colorScheme === 'dark' ? '#374151' : '#E9ECEF',
          },
        ]}>
        <Pressable style={styles.bookBtn} onPress={handleBook}>
          <Text style={styles.bookBtnText}>Book</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  retryBtn: {
    backgroundColor: '#FF1F8C',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  hero: { position: 'relative' },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: { height: 6, borderRadius: 3 },
  content: { paddingHorizontal: 16, paddingTop: 20, width: '100%' },
  hotelName: { ...textStyles.textBody14, fontSize: 13 },
  roomTitle: {
    ...textStyles.textHeading16,
    fontSize: 18,
    lineHeight: 24,
    marginTop: 4,
    width: '100%',
    flexShrink: 1,
  },
  roomSubtitle: { ...textStyles.textBody14, marginTop: 4 },
  boardLine: { ...textStyles.textBody14, marginTop: 6, width: '100%' },
  priceBlock: { width: '100%', maxWidth: '100%' },
  priceRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    rowGap: 4,
    columnGap: 8,
    width: '100%',
  },
  priceMain: {
    ...textStyles.textHeading20,
    flexShrink: 1,
    maxWidth: '100%',
  },
  priceSuffix: { ...textStyles.textBody12, fontSize: 11 },
  bodyText: { ...textStyles.textBody14, fontSize: 13 },
  sectionLabel: { ...textStyles.textHeading16, fontSize: 15 },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 0,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoTextCol: { flex: 1, minWidth: 0 },
  infoLabel: {
    ...textStyles.textBody12,
    color: '#9CA3AF',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  infoValue: {
    ...textStyles.textBody14,
    fontSize: 15,
    marginTop: 2,
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF33',
    marginVertical: 12,
  },
  inlineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  capacityCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  capacityBullet: { width: 12, ...textStyles.textBody14, fontSize: 13 },
  amenityWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: '100%',
  },
  amenityText: {
    ...textStyles.textBody14,
    color: '#FF1F8C',
    flexShrink: 1,
  },
  cta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bookBtn: {
    backgroundColor: '#FF1F8C',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  bookBtnText: { ...textStyles.textBody14, color: '#fff' },
});
