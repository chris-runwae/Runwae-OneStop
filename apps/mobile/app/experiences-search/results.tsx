import SectionedExperiencesResults from '@/components/discover/SectionedExperiencesResults';
import SkeletonBox from '@/components/ui/SkeletonBox';
import { Colors, textStyles } from '@/constants';
import { api } from '@runwae/convex/convex/_generated/api';
import { useAction } from 'convex/react';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Star, X as XIcon } from 'lucide-react-native';
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

type Provider =
  | 'viator'
  | 'liteapi'
  | 'duffel'
  | 'rentalcars'
  | 'tiqets'
  | 'yelp'
  | 'ticketmaster'
  | 'geoapify'
  | 'static';

type DiscoveryItem = {
  provider: Provider;
  apiRef: string;
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  externalUrl?: string;
  locationName?: string;
  rating?: number;
};

type Category = 'all' | 'tour' | 'event' | 'eat' | 'adventure';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80';

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'experiences',
  tour: 'tours',
  event: 'events',
  eat: 'eats',
  adventure: 'adventures',
};

const PROVIDER_LABELS: Partial<Record<Provider, string>> = {
  viator: 'Viator',
  tiqets: 'Tiqets',
  ticketmaster: 'Ticketmaster',
  yelp: 'Yelp',
  geoapify: 'Geoapify',
};

export default function ExperiencesResultsScreen() {
  const params = useLocalSearchParams<{
    term: string;
    category?: string;
    when?: string;
  }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const category = (params.category as Category) ?? 'all';
  const searchByCategory = useAction(api.discovery.searchByCategory);

  const [items, setItems] = useState<DiscoveryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    // The "all" branch is owned by <SectionedExperiencesResults>, which
    // makes its own per-section calls. Skip the merged fetch here so we
    // don't fire 4 redundant requests behind the sectioned UI.
    if (category === 'all') return;
    setError(null);
    setItems(null);
    try {
      const results = await Promise.all(
        [category as 'tour' | 'event' | 'eat' | 'adventure'].map((c) =>
          searchByCategory({
            category: c,
            term: params.term ?? '',
            limit: 20,
          })
            .then((res) => res as DiscoveryItem[])
            .catch(() => [] as DiscoveryItem[]),
        ),
      );

      const seen = new Set<string>();
      const merged: DiscoveryItem[] = [];
      for (const list of results) {
        for (const item of list) {
          const key = `${item.provider}:${item.apiRef}`;
          if (seen.has(key)) continue;
          seen.add(key);
          merged.push(item);
        }
      }
      setItems(merged);
    } catch (err) {
      setError((err as Error).message ?? 'Could not load experiences.');
      setItems([]);
    }
  }, [searchByCategory, params.term, category]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const headerSubtitle = useMemo(() => {
    return CATEGORY_LABELS[category] ?? 'experiences';
  }, [category]);

  const handleCardPress = (item: DiscoveryItem) => {
    if (item.provider === 'viator') {
      router.push({
        pathname: '/viator/[productCode]',
        params: { productCode: item.apiRef },
      });
      return;
    }
    router.push({
      pathname: '/experiences-search/detail',
      params: {
        provider: item.provider,
        apiRef: item.apiRef,
        category: item.category,
        title: item.title,
        imageUrl: item.imageUrl ?? '',
        externalUrl: item.externalUrl ?? '',
      },
    });
  };

  const renderCard = ({ item }: { item: DiscoveryItem }) => (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderColors.subtle,
        },
      ]}
      onPress={() => handleCardPress(item)}>
      <Image
        source={{ uri: item.imageUrl || FALLBACK_IMAGE }}
        style={styles.thumb}
        contentFit="cover"
      />
      <View style={styles.cardBody}>
        <View style={styles.providerRow}>
          <Text style={styles.providerChip}>
            via {PROVIDER_LABELS[item.provider] ?? item.provider}
          </Text>
        </View>
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
          {item.price ? (
            <Text style={[styles.price, { color: colors.textColors.default }]}>
              from {item.currency ?? 'USD'} {Math.round(item.price)}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundColors.default },
      ]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
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
            {params.term}
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

      {category === 'all' ? (
        <SectionedExperiencesResults
          term={params.term ?? ''}
          bottomInset={insets.bottom}
        />
      ) : items === null ? (
        <View style={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.skelCard}>
              <SkeletonBox width={104} height={104} borderRadius={12} />
              <View style={styles.skelLines}>
                <SkeletonBox width="40%" height={10} borderRadius={4} />
                <SkeletonBox width="80%" height={16} borderRadius={4} />
                <SkeletonBox width="55%" height={12} borderRadius={4} />
                <SkeletonBox width="30%" height={14} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <XIcon size={28} color={colors.textColors.subtle} />
          <Text
            style={[styles.emptyTitle, { color: colors.textColors.default }]}>
            {error ? 'Something went wrong' : 'Nothing matches that search'}
          </Text>
          <Text style={[styles.emptySub, { color: colors.textColors.subtle }]}>
            {error ?? 'Try a broader term or a different category.'}
          </Text>
          <Pressable style={styles.retryBtn} onPress={fetchResults}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `${item.provider}:${item.apiRef}`}
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
  headerTitle: { ...textStyles.textHeading16, fontSize: 16 },
  headerSubtitle: {
    ...textStyles.textBody12,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  skelCard: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  skelLines: { flex: 1, gap: 8, paddingVertical: 4 },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  thumb: { width: 104, height: 104, borderRadius: 10 },
  cardBody: { flex: 1, gap: 6 },
  providerRow: { flexDirection: 'row' },
  providerChip: {
    ...textStyles.textBody12,
    fontSize: 10,
    fontWeight: '700',
    color: '#FF1F8C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: { ...textStyles.textHeading16, fontSize: 15 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { ...textStyles.textBody12, flex: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
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
  price: { ...textStyles.textHeading16, fontSize: 14 },
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
  emptySub: { ...textStyles.textBody14, textAlign: 'center' },
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
