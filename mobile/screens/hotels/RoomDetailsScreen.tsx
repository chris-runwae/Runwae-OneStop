import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  BedDouble,
  Calendar,
  CreditCard,
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
import type { HotelDetail } from '@/types/hotel.types';
import type {
  LiteAPIHotelRoomRate,
  LiteAPIHotelRoomType,
} from '@/types/liteapi.types';
import { getCurrencySymbol } from '@/utils/currency';
import { ratePriceParts, roomGalleryForMappedRoom } from '@/utils/hotelRates';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function parseRoomRouteParams(
  hotelJson: unknown,
  roomBundleJson: unknown,
  rateIdStr: string | undefined
): { hotel: HotelDetail; roomType: LiteAPIHotelRoomType; rate: LiteAPIHotelRoomRate } | null {
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
    /** Serialized `HotelDetail` from HotelDetailsScreen */
    hotelJson?: string;
    /** Serialized `{ roomType, rate }` for this row */
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

  const { hotel, roomType, rate } = bundle;
  const taxes = rate.retailRate?.taxesAndFees ?? [];
  const refundable = rate.cancellationPolicies?.refundableTag === 'RFN';

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
          <Text style={[styles.roomTitle, { color: colors.textColors.default }]}>
            {rate.name}
          </Text>
          <Text style={[styles.boardLine, { color: colors.textColors.subtle }]}>
            {rate.boardName} · {roomType.rateType ?? 'Standard'} rate
          </Text>

          <Spacer size={16} vertical />

          <View style={styles.priceRow}>
            <Text style={styles.priceMain}>
              {price
                ? `${getCurrencySymbol(price.currency)} ${price.amount.toFixed(0)}`
                : '—'}
            </Text>
            <Text style={{ color: colors.textColors.subtle, fontSize: 13 }}>
              / night (suggested)
            </Text>
          </View>

          {roomType.suggestedSellingPrice &&
          typeof roomType.suggestedSellingPrice.amount === 'number' ? (
            <Text style={{ color: colors.textColors.subtle, fontSize: 12 }}>
              Room type from {getCurrencySymbol(roomType.suggestedSellingPrice.currency)}{' '}
              {roomType.suggestedSellingPrice.amount.toFixed(0)}
            </Text>
          ) : null}

          <Spacer size={20} vertical />

          <View
            style={[
              styles.infoCard,
              {
                borderColor: colorScheme === 'dark' ? '#374151' : '#E9ECEF',
              },
            ]}>
            <View style={styles.infoRow}>
              <Calendar size={18} color="#FF1F8C" />
              <View>
                <Text style={styles.infoLabel}>Stay</Text>
                <Text style={styles.infoValue}>
                  {fmt(checkin)} → {fmt(checkout)}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Users size={18} color="#FF1F8C" />
              <View>
                <Text style={styles.infoLabel}>Guests</Text>
                <Text style={styles.infoValue}>
                  {adults} adult{adults === 1 ? '' : 's'} · up to{' '}
                  {rate.maxOccupancy} guests
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <BedDouble size={18} color="#FF1F8C" />
              <View>
                <Text style={styles.infoLabel}>Occupancy</Text>
                <Text style={styles.infoValue}>
                  {rate.adultCount} adults
                  {rate.childCount > 0
                    ? `, ${rate.childCount} children`
                    : ''}
                </Text>
              </View>
            </View>
          </View>

          <Spacer size={20} vertical />

          <Text style={styles.sectionLabel}>Cancellation</Text>
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
              }}>
              {refundable
                ? 'Free cancellation (see policy for deadlines).'
                : 'Non-refundable for this rate.'}
            </Text>
          </View>

          {taxes.length > 0 ? (
            <>
              <Spacer size={20} vertical />
              <Text style={styles.sectionLabel}>Taxes & fees</Text>
              <Spacer size={8} vertical />
              {taxes.map((t, i) => (
                <View key={i} style={styles.taxRow}>
                  <Text style={{ color: colors.textColors.subtle, flex: 1 }}>
                    {t.description}
                    {t.included ? ' (included)' : ''}
                  </Text>
                  <Text style={{ color: colors.textColors.default }}>
                    {getCurrencySymbol(t.currency)} {t.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </>
          ) : null}

          {rate.commission?.length ? (
            <>
              <Spacer size={16} vertical />
              <Text style={styles.sectionLabel}>Commission</Text>
              <Spacer size={6} vertical />
              <Text style={{ color: colors.textColors.subtle, fontSize: 13 }}>
                {getCurrencySymbol(rate.commission[0].currency)}{' '}
                {rate.commission[0].amount.toFixed(2)}
              </Text>
            </>
          ) : null}

          {rate.paymentTypes?.length ? (
            <>
              <Spacer size={20} vertical />
              <Text style={styles.sectionLabel}>Payment</Text>
              <Spacer size={8} vertical />
              <View style={styles.inlineRow}>
                <CreditCard size={16} color={colors.textColors.subtle} />
                <Text style={{ color: colors.textColors.subtle, flex: 1 }}>
                  {rate.paymentTypes.join(' · ')}
                </Text>
              </View>
            </>
          ) : null}

          <Spacer size={16} vertical />
          <View style={styles.idsBox}>
            <Text style={styles.idsLabel}>Booking reference ids</Text>
            <Text selectable style={styles.idsMono}>
              rateId: {rate.rateId}
            </Text>
            <Text selectable style={styles.idsMono}>
              offerId: {roomType.offerId}
            </Text>
          </View>
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
  content: { paddingHorizontal: 16, paddingTop: 20 },
  hotelName: { ...textStyles.textBody14, fontSize: 13 },
  roomTitle: { ...textStyles.textHeading16, fontSize: 22, marginTop: 4 },
  boardLine: { fontSize: 14, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  priceMain: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF1F8C',
  },
  sectionLabel: { ...textStyles.textHeading16, fontSize: 15 },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 0,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoLabel: {
    ...textStyles.textBody12,
    color: '#9CA3AF',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  infoValue: { ...textStyles.textBody14, fontSize: 15, marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF33',
    marginVertical: 12,
  },
  inlineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  idsBox: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#00000008',
  },
  idsLabel: {
    ...textStyles.textBody12,
    fontSize: 11,
    marginBottom: 6,
    color: '#6B7280',
  },
  idsMono: { fontSize: 10, color: '#6B7280' },
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
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
