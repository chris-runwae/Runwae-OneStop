import { Colors, textStyles } from '@/constants';
import SkeletonBox from '@/components/ui/SkeletonBox';
import { shareEntity } from '@/lib/shareEntity';
import { api } from '@runwae/convex/convex/_generated/api';
import { FlashList } from '@shopify/flash-list';
import { useAction } from 'convex/react';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Coffee,
  Dumbbell,
  MapPin,
  ParkingCircle,
  Share2,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Star,
  Utensils,
  Waves,
  Wifi,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DiscoveryDetail = {
  apiRef: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  locationName?: string;
  rating?: number;
  gallery?: string[];
  amenities?: string[];
  address?: string;
  reviewCount?: number;
};

type LiteApiRate = {
  rateId: string;
  offerId: string;
  roomName: string;
  roomDescription?: string;
  boardName?: string;
  bedTypes?: string[];
  refundable: boolean;
  cancellationPolicy?: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
};

function amenityIcon(facility: string): React.ReactNode {
  const lower = facility.toLowerCase();
  if (lower.includes('wifi') || lower.includes('internet'))
    return <Wifi size={14} color="#FF1F8C" />;
  if (lower.includes('pool') || lower.includes('swim'))
    return <Waves size={14} color="#FF1F8C" />;
  if (lower.includes('breakfast') || lower.includes('coffee'))
    return <Coffee size={14} color="#FF1F8C" />;
  if (lower.includes('restaurant') || lower.includes('dining'))
    return <Utensils size={14} color="#FF1F8C" />;
  if (lower.includes('gym') || lower.includes('fitness'))
    return <Dumbbell size={14} color="#FF1F8C" />;
  if (lower.includes('park'))
    return <ParkingCircle size={14} color="#FF1F8C" />;
  return <Sparkles size={14} color="#FF1F8C" />;
}

export default function HotelsSearchHotelScreen() {
  const params = useLocalSearchParams<{
    hotelId: string;
    hotelName: string;
    hotelThumb?: string;
    checkin: string;
    checkout: string;
    adults: string;
    rooms?: string;
    tripId?: string;
    eventId?: string;
  }>();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const adults = parseInt(params.adults ?? '2', 10);
  const nights = useMemo(() => {
    if (!params.checkin || !params.checkout) return 1;
    const a = new Date(params.checkin);
    const b = new Date(params.checkout);
    return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000));
  }, [params.checkin, params.checkout]);

  const getDetail = useAction(api.hotels.getDetail);
  const getRates = useAction(api.hotels.getRates);

  const [detail, setDetail] = useState<DiscoveryDetail | null>(null);
  const [rates, setRates] = useState<LiteApiRate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const fetchAll = useCallback(async () => {
    setError(null);
    setDetail(null);
    setRates(null);
    try {
      const [d, r] = await Promise.all([
        getDetail({ apiRef: params.hotelId }) as Promise<DiscoveryDetail | null>,
        getRates({
          apiRef: params.hotelId,
          checkin: params.checkin,
          checkout: params.checkout,
          adults,
        }) as Promise<LiteApiRate[]>,
      ]);
      if (!d) {
        setError('Hotel not found.');
        setDetail(null);
        setRates([]);
        return;
      }
      setDetail(d);
      setRates(r ?? []);
    } catch (err) {
      setError((err as Error).message ?? 'Could not load this hotel.');
    }
  }, [getDetail, getRates, params.hotelId, params.checkin, params.checkout, adults]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const galleryImages = useMemo(() => {
    if (!detail) return [];
    if (detail.gallery?.length) return detail.gallery.slice(0, 8);
    if (detail.imageUrl) return [detail.imageUrl];
    if (params.hotelThumb) return [params.hotelThumb];
    return [];
  }, [detail, params.hotelThumb]);

  const amenityChips = useMemo(() => {
    return (detail?.amenities ?? []).slice(0, 8);
  }, [detail]);

  const handleShare = useCallback(async () => {
    try {
      const dateLabel =
        params.checkin && params.checkout
          ? `${format(new Date(params.checkin), 'MMM d')} – ${format(new Date(params.checkout), 'MMM d')}`
          : undefined;
      await shareEntity({
        kind: 'hotel',
        id: params.hotelId,
        title: detail?.title ?? params.hotelName ?? 'Hotel',
        subtitle: dateLabel
          ? `${dateLabel} · ${adults} ${adults === 1 ? 'guest' : 'guests'}`
          : undefined,
        query: {
          checkin: params.checkin,
          checkout: params.checkout,
          adults: String(adults),
        },
      });
    } catch {
      // user dismissed; nothing to surface
    }
  }, [detail, params, adults]);

  const handleSelectRate = (rate: LiteApiRate) => {
    router.push({
      pathname: '/hotel/book',
      params: {
        hotelId: params.hotelId,
        hotelName: detail?.title ?? params.hotelName ?? '',
        hotelThumb: detail?.imageUrl ?? params.hotelThumb ?? '',
        offerId: rate.offerId,
        roomName: rate.roomName,
        boardName: rate.boardName ?? 'Room only',
        price: String(rate.pricePerNight),
        currency: rate.currency,
        checkin: params.checkin,
        checkout: params.checkout,
        adults: String(adults),
        rateId: rate.rateId,
        ...(params.tripId ? { tripId: params.tripId } : {}),
        ...(params.eventId ? { eventId: params.eventId } : {}),
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
        {galleryImages.length > 0 ? (
          <FlashList
            data={galleryImages}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
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
        ) : (
          <View
            style={{
              width: SCREEN_WIDTH,
              height: 280,
              backgroundColor: colors.backgroundColors.subtle,
            }}
          />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.45)', 'transparent']}
          style={styles.galleryTopGradient}
          pointerEvents="none"
        />

        <Pressable
          onPress={() => router.back()}
          style={[styles.headerCircle, styles.backBtn, { top: insets.top + 8 }]}>
          <ArrowLeft size={20} color="#fff" />
        </Pressable>
        <Pressable
          onPress={handleShare}
          style={[styles.headerCircle, styles.shareBtn, { top: insets.top + 8 }]}>
          <Share2 size={18} color="#fff" />
        </Pressable>

        {galleryImages.length > 1 ? (
          <View style={styles.dots}>
            {galleryImages.map((_, i) => (
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
        ) : null}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={[styles.hotelName, { color: colors.textColors.default }]}>
                {detail?.title ?? params.hotelName ?? 'Hotel'}
              </Text>
              {detail?.locationName ? (
                <View style={styles.locationRow}>
                  <MapPin size={13} color="#FF1F8C" />
                  <Text
                    style={[
                      styles.address,
                      { color: colors.textColors.subtle },
                    ]}
                    numberOfLines={2}>
                    {detail.address ?? detail.locationName}
                  </Text>
                </View>
              ) : detail === null ? (
                <SkeletonBox width="60%" height={14} borderRadius={4} />
              ) : null}
            </View>
            {detail?.rating ? (
              <View style={styles.ratingBadge}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>
                  {detail.rating.toFixed(1)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Stay summary chip */}
          <View
            style={[
              styles.stayChip,
              { borderColor: colors.borderColors.subtle },
            ]}>
            <Text
              style={[styles.stayLabel, { color: colors.textColors.subtle }]}>
              {params.checkin
                ? format(new Date(params.checkin), 'MMM d')
                : 'Check-in'}
              {' → '}
              {params.checkout
                ? format(new Date(params.checkout), 'MMM d')
                : 'Check-out'}
              {' · '}
              {nights} {nights === 1 ? 'night' : 'nights'}
              {' · '}
              {adults} {adults === 1 ? 'guest' : 'guests'}
            </Text>
          </View>

          {/* Amenities */}
          {amenityChips.length > 0 ? (
            <>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.textColors.default },
                ]}>
                Amenities
              </Text>
              <View style={styles.amenityRow}>
                {amenityChips.map((a, idx) => (
                  <View key={`${a}-${idx}`} style={styles.amenityChip}>
                    {amenityIcon(a)}
                    <Text style={styles.amenityText}>{a}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* Description */}
          {detail?.description ? (
            <>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.textColors.default },
                ]}>
                About
              </Text>
              <RenderHTML
                contentWidth={width - 32}
                source={{ html: detail.description }}
                baseStyle={{
                  color: colors.textColors.subtle,
                  ...textStyles.textBody14,
                  lineHeight: 22,
                } as any}
              />
            </>
          ) : null}

          {/* Rooms */}
          <Text
            style={[styles.sectionLabel, { color: colors.textColors.default }]}>
            Available rooms
          </Text>

          {rates === null ? (
            <View style={{ gap: 12 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.rateCard,
                    { borderColor: colors.borderColors.subtle },
                  ]}>
                  <View style={{ flex: 1, gap: 8 }}>
                    <SkeletonBox width="70%" height={16} borderRadius={4} />
                    <SkeletonBox width="40%" height={12} borderRadius={4} />
                    <SkeletonBox width="55%" height={12} borderRadius={4} />
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <SkeletonBox width={70} height={18} borderRadius={4} />
                    <SkeletonBox width={60} height={28} borderRadius={8} />
                  </View>
                </View>
              ))}
            </View>
          ) : rates.length === 0 ? (
            <View
              style={[
                styles.emptyRates,
                { borderColor: colors.borderColors.subtle },
              ]}>
              <Text
                style={[
                  styles.emptyRatesText,
                  { color: colors.textColors.subtle },
                ]}>
                {error ?? 'No rooms available for these dates. Try shifting your stay.'}
              </Text>
            </View>
          ) : (
            rates.map((rate, idx) => (
              <Pressable
                key={`${rate.offerId}-${idx}`}
                style={[
                  styles.rateCard,
                  { borderColor: colors.borderColors.subtle },
                ]}
                onPress={() => handleSelectRate(rate)}>
                <View style={styles.rateInfo}>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.roomName,
                      { color: colors.textColors.default },
                    ]}>
                    {rate.roomName}
                  </Text>
                  {rate.boardName ? (
                    <Text
                      style={[
                        styles.boardName,
                        { color: colors.textColors.subtle },
                      ]}>
                      {rate.boardName}
                      {rate.bedTypes && rate.bedTypes.length > 0
                        ? ` · ${rate.bedTypes.join(', ')}`
                        : ''}
                    </Text>
                  ) : null}
                  <View style={styles.refundRow}>
                    {rate.refundable ? (
                      <>
                        <ShieldCheck size={12} color="#22C55E" />
                        <Text style={styles.refundText}>
                          Free cancellation
                        </Text>
                      </>
                    ) : (
                      <>
                        <ShieldOff size={12} color="#EF4444" />
                        <Text
                          style={[styles.refundText, { color: '#EF4444' }]}>
                          Non-refundable
                        </Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.ratePriceCol}>
                  <Text style={styles.ratePrice}>
                    {rate.currency} {Math.round(rate.pricePerNight)}
                  </Text>
                  <Text
                    style={[
                      styles.perNight,
                      { color: colors.textColors.subtle },
                    ]}>
                    / night
                  </Text>
                  {nights > 1 ? (
                    <Text
                      style={[
                        styles.totalForStay,
                        { color: colors.textColors.subtle },
                      ]}>
                      {rate.currency} {Math.round(rate.totalPrice)} total
                    </Text>
                  ) : null}
                  <View style={styles.selectBtn}>
                    <Text style={styles.selectText}>Select</Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Gallery
  gallery: { position: 'relative' },
  galleryTopGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headerCircle: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: { left: 16 },
  shareBtn: { right: 16 },
  dots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: { height: 6, borderRadius: 3 },

  // Content
  content: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  hotelName: {
    ...textStyles.textHeading20,
    fontSize: 22,
    lineHeight: 28,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    ...textStyles.textBody12,
    flex: 1,
  },
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
  ratingText: {
    ...textStyles.textHeading16,
    fontSize: 13,
    color: '#FF1F8C',
  },
  stayChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  stayLabel: {
    ...textStyles.textBody14,
  },
  sectionLabel: {
    ...textStyles.textHeading16,
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
  amenityText: {
    ...textStyles.textBody12,
    color: '#FF1F8C',
  },

  // Rate cards
  rateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  rateInfo: { flex: 1, gap: 4 },
  roomName: {
    ...textStyles.textHeading16,
    fontSize: 14,
  },
  boardName: {
    ...textStyles.textBody12,
  },
  refundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  refundText: {
    ...textStyles.textBody12,
    fontSize: 11,
    color: '#22C55E',
  },
  ratePriceCol: { alignItems: 'flex-end', gap: 2 },
  ratePrice: {
    ...textStyles.textHeading16,
    fontSize: 16,
    color: '#FF1F8C',
  },
  perNight: {
    ...textStyles.textBody12,
    fontSize: 11,
  },
  totalForStay: {
    ...textStyles.textBody12,
    fontSize: 11,
  },
  selectBtn: {
    backgroundColor: '#FF1F8C',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 6,
  },
  selectText: {
    ...textStyles.textHeading16,
    color: '#fff',
    fontSize: 12,
  },
  emptyRates: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emptyRatesText: {
    ...textStyles.textBody14,
    textAlign: 'center',
  },
});
