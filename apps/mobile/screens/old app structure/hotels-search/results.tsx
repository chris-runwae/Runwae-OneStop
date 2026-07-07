import { Colors, textStyles } from '@/constants';
import SkeletonBox from '@/components/ui/SkeletonBox';
import { api } from '@runwae/convex/convex/_generated/api';
import { useAction } from 'convex/react';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Star,
  X as XIcon,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DiscoveryItem = {
  apiRef: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  // Pre-discount price exposed by the provider when the offer beats MSRP.
  originalPrice?: number;
  currency?: string;
  locationName?: string;
  rating?: number;
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

export default function HotelsResultsScreen() {
  const params = useLocalSearchParams<{
    destination: string;
    checkin: string;
    checkout: string;
    adults: string;
    rooms: string;
  }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const adults = parseInt(params.adults ?? '2', 10);
  const search = useAction(api.hotels.search);

  const [results, setResults] = useState<DiscoveryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    setError(null);
    setResults(null);
    try {
      const data = (await search({
        term: params.destination,
        checkin: params.checkin,
        checkout: params.checkout,
        adults,
        limit: 20,
      })) as DiscoveryItem[];
      setResults(data);
    } catch (err) {
      setError((err as Error).message ?? 'Could not load hotels.');
      setResults([]);
    }
  }, [search, params.destination, params.checkin, params.checkout, adults]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const headerSubtitle = useMemo(() => {
    const fmt = (s?: string) => (s ? format(new Date(s), 'MMM d') : '');
    return `${fmt(params.checkin)} – ${fmt(params.checkout)} · ${adults} ${adults === 1 ? 'guest' : 'guests'}`;
  }, [params.checkin, params.checkout, adults]);

  const renderCard = ({ item, index }: { item: DiscoveryItem; index: number }) => (
    <Pressable
      testID={`hotel-result-card-${index}`}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.borderColors.subtle },
      ]}
      onPress={() => {
        router.push({
          pathname: '/hotels-search/hotel',
          params: {
            hotelId: item.apiRef,
            hotelName: item.title,
            hotelThumb: item.imageUrl ?? '',
            checkin: params.checkin,
            checkout: params.checkout,
            adults: String(adults),
            rooms: params.rooms ?? '1',
          },
        });
      }}>
      <Image
        source={{ uri: item.imageUrl || FALLBACK_IMAGE }}
        style={styles.thumb}
        contentFit="cover"
      />
      <View style={styles.cardBody}>
        <Text
          numberOfLines={2}
          style={[styles.cardTitle, { color: colors.textColors.default }]}>
          {item.title}
        </Text>
        {item.locationName ? (
          <View style={styles.locationRow}>
            <MapPin size={12} color="#FF1F8C" />
            <Text
              numberOfLines={1}
              style={[
                styles.locationText,
                { color: colors.textColors.subtle },
              ]}>
              {item.locationName}
            </Text>
          </View>
        ) : null}
        <View style={styles.metaRow}>
          {item.rating ? (
            <View style={styles.ratingChip}>
              <Star size={11} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          ) : null}
          <View style={styles.refundChip}>
            <ShieldCheck size={10} color="#22C55E" />
            <Text style={styles.refundText}>Free cancellation</Text>
          </View>
        </View>
        {item.price ? (
          <View style={styles.priceRow}>
            {item.originalPrice && item.originalPrice > item.price ? (
              <Text style={styles.originalPrice}>
                {item.currency ?? 'USD'} {Math.round(item.originalPrice)}
              </Text>
            ) : null}
            <Text style={[styles.price, { color: colors.textColors.default }]}>
              {item.currency ?? 'USD'} {Math.round(item.price)}
            </Text>
            <Text
              style={[styles.perNight, { color: colors.textColors.subtle }]}>
              / night
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundColors.default },
      ]}>
      {/* This screen is presented as a modal (see app/_layout.tsx) — iOS
          already drops the sheet below the status bar, so don't add
          `insets.top` on top or the header floats too far down. */}
      <View style={[styles.header, { paddingTop: 12 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={[
            styles.headerBtn,
            { backgroundColor: colors.backgroundColors.subtle },
          ]}>
          <ArrowLeft size={18} color={colors.textColors.default} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text
            numberOfLines={1}
            style={[styles.headerTitle, { color: colors.textColors.default }]}>
            {params.destination}
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.headerSubtitle,
              { color: colors.textColors.subtle },
            ]}>
            {headerSubtitle}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {results === null ? (
        <View style={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.skelCard}>
              <SkeletonBox width={104} height={104} borderRadius={12} />
              <View style={styles.skelLines}>
                <SkeletonBox width="80%" height={16} borderRadius={4} />
                <SkeletonBox width="55%" height={12} borderRadius={4} />
                <SkeletonBox width="40%" height={12} borderRadius={4} />
                <SkeletonBox width="30%" height={18} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <XIcon size={28} color={colors.textColors.subtle} />
          <Text
            style={[styles.emptyTitle, { color: colors.textColors.default }]}>
            {error ? 'Something went wrong' : `No stays in ${params.destination}`}
          </Text>
          <Text
            style={[styles.emptySub, { color: colors.textColors.subtle }]}>
            {error ?? 'Try different dates or a nearby city.'}
          </Text>
          <Pressable style={styles.retryBtn} onPress={fetchResults}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.apiRef}
          renderItem={renderCard}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 24 },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: { flex: 1 },
  headerTitle: {
    ...textStyles.textHeading16,
    fontSize: 16,
  },
  headerSubtitle: {
    ...textStyles.textBody12,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  skelCard: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  skelLines: {
    flex: 1,
    gap: 8,
    paddingVertical: 4,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  thumb: {
    width: 104,
    height: 104,
    borderRadius: 10,
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    ...textStyles.textHeading16,
    fontSize: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...textStyles.textBody12,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FF1F8C15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: {
    ...textStyles.textBody12,
    fontSize: 11,
    fontWeight: '700',
    color: '#FF1F8C',
  },
  refundChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#22C55E15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  refundText: {
    ...textStyles.textBody12,
    fontSize: 10,
    fontWeight: '600',
    color: '#22C55E',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 'auto',
    flexWrap: 'wrap',
  },
  price: {
    ...textStyles.textHeading16,
  },
  // Strikethrough red price shown next to the offer price when the
  // provider exposes an MSRP higher than `price`.
  originalPrice: {
    ...textStyles.textBody12,
    color: '#DA2020',
    textDecorationLine: 'line-through',
  },
  perNight: {
    ...textStyles.textBody12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    ...textStyles.textHeading16,
    fontSize: 16,
    textAlign: 'center',
  },
  emptySub: {
    ...textStyles.textBody14,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#FF1F8C',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 6,
  },
  retryText: {
    ...textStyles.textHeading16,
    color: '#fff',
    fontSize: 14,
  },
});
