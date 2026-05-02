import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  ShieldOff,
  Star,
  Utensils,
  Waves,
  Wifi,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacer, Text } from '@/components';
import { Colors, textStyles } from '@/constants';
import type { HotelDetail, HotelRate } from '@/types/hotel.types';
import { useAction } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import { normalizeHotelRooms } from '@/utils/hotelRoom';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function amenityLabel(facility: string) {
  const lower = facility.toLowerCase();
  if (lower.includes('wifi') || lower.includes('internet'))
    return { label: 'WiFi', icon: <Wifi size={14} color="#FF1F8C" /> };
  if (lower.includes('pool') || lower.includes('swim'))
    return { label: 'Pool', icon: <Waves size={14} color="#FF1F8C" /> };
  if (lower.includes('restaurant') || lower.includes('breakfast'))
    return {
      label: 'Restaurant',
      icon: <Utensils size={14} color="#FF1F8C" />,
    };
  return null;
}

// Convex's hotels.getDetail returns a DiscoveryDetail; the legacy
// HotelDetail shape carries richer fields (rooms/policies/sentiment)
// that aren't surfaced in the discovery payload. We keep them as empty
// placeholders for now — the hotel detail page degrades gracefully
// when these are absent.
function mapDetails(raw: any): HotelDetail {
  return {
    hotelId: raw.apiRef,
    name: raw.title ?? '',
    rating: raw.rating ?? 0,
    address: raw.address ?? raw.locationName ?? '',
    thumbnail: raw.imageUrl ?? '',
    gallery: raw.gallery ?? (raw.imageUrl ? [raw.imageUrl] : []),
    description: raw.description ?? '',
    minRate: raw.price ?? 0,
    currency: raw.currency ?? 'USD',
    offerId: '',
    amenities: raw.amenities ?? [],
    city: '',
    country: '',
    coordinates: {
      latitude: raw.coords?.lat ?? 0,
      longitude: raw.coords?.lng ?? 0,
    },
    rooms: normalizeHotelRooms([]),
  };
}

export default function HotelDetailScreen() {
  const {
    hotelId,
    tripId,
    checkin,
    checkout,
    adults: adultsStr,
    eventId,
  } = useLocalSearchParams<{
    hotelId: string;
    tripId: string;
    checkin: string;
    checkout: string;
    adults: string;
    eventId?: string;
  }>();

  const adults = parseInt(adultsStr ?? '', 10);
  const canFetchRates = Boolean(checkin && checkout && adultsStr && !isNaN(adults));
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [rates, setRates] = useState<HotelRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const getDetailAction = useAction(api.hotels.getDetail);
  const getRatesAction = useAction(api.hotels.getRates);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await getDetailAction({ apiRef: hotelId });
      if (!detail) {
        setError('Hotel not found');
        setLoading(false);
        return;
      }
      setHotel(mapDetails(detail));

      if (canFetchRates) {
        try {
          const liteRates = await getRatesAction({
            apiRef: hotelId,
            checkin: checkin!,
            checkout: checkout!,
            adults,
          });
          setRates(
            liteRates.map((r: any) => ({
              offerId: r.offerId,
              roomName: r.name ?? 'Standard Room',
              boardName: r.boardName ?? 'Room Only',
              price: r.priceTotal ?? r.price ?? 0,
              currency: r.currency ?? 'USD',
              refundable: r.refundable ?? false,
              cancelDeadline: r.cancelDeadline,
            })),
          );
        } catch (rateErr) {
          console.warn(
            '[Hotels] Could not fetch rates:',
            (rateErr as Error).message,
          );
          setRates([]);
        }
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load hotel details');
    } finally {
      setLoading(false);
    }
  }, [hotelId, checkin, checkout, adults, canFetchRates, getDetailAction, getRatesAction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.backgroundColors.default },
        ]}>
        <ActivityIndicator color="#FF1F8C" size="large" />
      </View>
    );
  }

  if (error || !hotel) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.backgroundColors.default },
        ]}>
        <Text style={{ color: colors.textColors.subtle }}>
          {error ?? 'Hotel not found.'}
        </Text>
        <Pressable style={styles.retryBtn} onPress={fetchData}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const amenityItems = (hotel?.amenities ?? [])
    ?.map(amenityLabel)
    ?.filter(Boolean)
    ?.slice(0, 6) as { label: string; icon: React.ReactNode }[];

  const handleSelectRate = (rate: HotelRate) => {
    router.push({
      pathname: '/hotel/book',
      params: {
        hotelId: hotel.hotelId,
        hotelName: hotel.name,
        hotelThumb: hotel.thumbnail,
        offerId: rate.offerId,
        roomName: rate.roomName,
        boardName: rate.boardName,
        price: rate.price,
        currency: rate.currency,
        checkin,
        checkout,
        adults: String(adults),
        tripId,
        ...(eventId ? { eventId } : {}),
      },
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundColors.default },
      ]}>
      {/* Gallery */}
      <View style={styles.gallery}>
        <FlashList
          data={hotel.gallery.slice(0, 8)}
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
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{ width: SCREEN_WIDTH, height: 280 }}
              contentFit="cover"
            />
          )}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.45)', 'transparent']}
          style={styles.galleryTopGradient}
        />
        {/* Back button */}
        <Pressable
          style={[styles.backBtn, { top: insets.top + 8 }]}
          onPress={() => router.back()}>
          <ArrowLeft size={20} color="#fff" />
        </Pressable>
        {/* Dot indicators */}
        <View style={styles.dots}>
          {hotel.gallery.slice(0, 8).map((_, i) => (
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <View style={styles.locationRow}>
                <MapPin size={13} color="#FF1F8C" />
                <Text
                  style={[styles.address, { color: colors.textColors.subtle }]}
                  numberOfLines={1}>
                  {hotel.address}
                </Text>
              </View>
            </View>
            <View style={styles.ratingBadge}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>
                {hotel.rating > 0 ? hotel.rating.toFixed(1) : '—'}
              </Text>
            </View>
          </View>

          <Spacer size={16} vertical />

          {/* Amenities */}
          {amenityItems.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Amenities</Text>
              <Spacer size={10} vertical />
              <View style={styles.amenityRow}>
                {amenityItems.map((a, index) => (
                  <View key={`${a.label}-${index}`} style={styles.amenityChip}>
                    {a.icon}
                    <Text style={styles.amenityText}>{a.label}</Text>
                  </View>
                ))}
              </View>
              <Spacer size={16} vertical />
            </>
          )}

          {/* Description */}
          {hotel.description ? (
            <>
              <Text style={styles.sectionLabel}>About</Text>
              <Spacer size={8} vertical />
              <RenderHTML
                contentWidth={width - 32}
                source={{ html: hotel.description }}
                baseStyle={{
                  color: colors.textColors.subtle,
                  ...textStyles.textBody14,
                  lineHeight: 22,
                } as any}
              />
              <Spacer size={16} vertical />
            </>
          ) : null}

          {/* Rates */}
          {(canFetchRates || rates.length > 0) && (
            <>
              <Text style={styles.sectionLabel}>Available Rooms</Text>
              <Spacer size={12} vertical />
            </>
          )}

          {canFetchRates && rates.length === 0 ? (
            <Text style={{ color: colors.textColors.subtle, fontSize: 13 }}>
              No rates available for the selected dates.
            </Text>
          ) : rates.length > 0 ? (
            rates.map((rate, index) => (
              <Pressable
                key={`${index}-${rate?.offerId ?? ''}`}
                style={[
                  styles.rateCard,
                  {
                    borderColor: colorScheme === 'dark' ? '#374151' : '#E9ECEF',
                  },
                ]}
                onPress={() => handleSelectRate(rate)}>
                <View style={styles.rateInfo}>
                  <Text style={styles.roomName}>{rate.roomName}</Text>
                  <Text
                    style={[
                      styles.boardName,
                      { color: colors.textColors.subtle },
                    ]}>
                    {rate.boardName}
                  </Text>
                  <View style={styles.refundRow}>
                    {rate.refundable ? (
                      <>
                        <ShieldCheck size={12} color="#22C55E" />
                        <Text style={styles.refundText}>Free cancellation</Text>
                      </>
                    ) : (
                      <>
                        <ShieldOff size={12} color="#EF4444" />
                        <Text style={[styles.refundText, { color: '#EF4444' }]}>
                          Non-refundable
                        </Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.ratePriceCol}>
                  <Text style={styles.ratePrice}>
                    {rate.currency} {rate.price.toFixed(0)}
                  </Text>
                  <Text
                    style={[
                      styles.perNight,
                      { color: colors.textColors.subtle },
                    ]}>
                    / night
                  </Text>
                  <View style={styles.selectBtn}>
                    <Text style={styles.selectText}>Select</Text>
                  </View>
                </View>
              </Pressable>
            ))
          ) : null}

          <Spacer size={40} vertical />
        </View>
      </ScrollView>
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
  },
  retryBtn: {
    backgroundColor: '#FF1F8C',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },

  // Gallery
  gallery: { position: 'relative' },
  galleryTopGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },

  // Content
  content: { paddingHorizontal: 16, paddingTop: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  headerLeft: { flex: 1 },
  hotelName: {
    ...textStyles.bold_20,
    fontSize: 20,
    lineHeight: 26,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  address: { ...textStyles.regular_14, fontSize: 12, flex: 1 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF1F8C15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  ratingText: { fontWeight: '700', fontSize: 13, color: '#FF1F8C' },
  sectionLabel: {
    ...textStyles.bold_20,
    fontSize: 15,
  },
  amenityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#FF1F8C30',
    backgroundColor: '#FF1F8C08',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  amenityText: { fontSize: 12, color: '#FF1F8C' },
  description: { ...textStyles.regular_14, lineHeight: 22 },

  // Rate cards
  rateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  rateInfo: { flex: 1, gap: 4 },
  roomName: { ...textStyles.bold_20, fontSize: 14 },
  boardName: { ...textStyles.regular_14, fontSize: 12 },
  refundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  refundText: { fontSize: 11, color: '#22C55E' },
  ratePriceCol: { alignItems: 'flex-end', gap: 2 },
  ratePrice: { ...textStyles.bold_20, fontSize: 16, color: '#FF1F8C' },
  perNight: { fontSize: 11 },
  selectBtn: {
    backgroundColor: '#FF1F8C',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 6,
  },
  selectText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
