import { useAction, useMutation, useQuery } from 'convex/react';
import {
  openBrowserAsync,
  WebBrowserPresentationStyle,
} from 'expo-web-browser';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { RefreshCcw } from 'lucide-react-native';

import { api } from '@runwae/convex/convex/_generated/api';
import { AppFonts, Colors } from '@/constants';
import {
  DISCOVER_CATEGORIES,
  DISCOVER_SAMPLES,
  CHIP_QUERY,
  defaultSearchDates,
  type DiscoverItem,
} from '@/constants/discoverCategories';
import SkeletonBox from '@/components/ui/SkeletonBox';
import DiscoverCard, {
  type SaveControls,
} from '@/components/discover/DiscoverCard';
import Text from '@/components/ui/Text';
import Spacer from '../utils/Spacer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GUTTER = 8;
const SIDE_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - SIDE_PADDING * 2 - GUTTER) / 2;

type Props = {
  /** Source city for the search term. Use viewer.homeCity on Home, trip
   *  destinationLabel on trip-detail Discover, destination.title on the
   *  destination-detail screen. */
  city: string;
  coords?: { lat: number; lng: number };
  originIata?: string | null;
  destinationIata?: string | null;
  checkin?: string;
  checkout?: string;
  initialCategory?: string;
  excludeCategories?: readonly string[];
  showHeading?: boolean;
  heading?: string;
};

export default function DiscoverGrid({
  city,
  coords,
  originIata,
  destinationIata,
  checkin,
  checkout,
  initialCategory = 'all',
  excludeCategories,
  showHeading = true,
  heading = 'Discover',
}: Props) {
  type ColorScheme = keyof typeof Colors;
  const colorScheme = (useColorScheme() ?? 'light') as ColorScheme;
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const search = useAction(api.discovery.searchByCategory);
  const savedKeys = useQuery(api.user_saves.listKeys, {});
  const addSave = useMutation(api.user_saves.add);
  const removeSave = useMutation(api.user_saves.remove);

  const [active, setActive] = useState<string>(initialCategory);

  const [refreshTick, setRefreshTick] = useState(0);

  const visibleCategories = useMemo(
    () =>
      excludeCategories
        ? DISCOVER_CATEGORIES.filter((c) => !excludeCategories.includes(c.k))
        : DISCOVER_CATEGORIES,
    [excludeCategories]
  );

  const savedSet = useMemo(() => {
    const s = new Set<string>();
    for (const k of savedKeys ?? []) s.add(`${k.provider}:${k.apiRef}`);
    return s;
  }, [savedKeys]);

  const saveControls: SaveControls = useMemo(
    () => ({
      isSaved: (provider, apiRef) => savedSet.has(`${provider}:${apiRef}`),
      toggle: async (item) => {
        const key = `${item.provider}:${item.apiRef}`;
        if (savedSet.has(key)) {
          await removeSave({ provider: item.provider, apiRef: item.apiRef });
        } else {
          await addSave({
            provider: item.provider,
            apiRef: item.apiRef,
            // Backend CATEGORY validator accepts hotel/flight/tour/activity/
            // restaurant/event/destination/trip/other — map keys accordingly.
            category: mapToSaveCategory(item.category),
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            price: item.price,
            currency: item.currency,
            locationName: item.locationName,
            coords: item.coords,
            externalUrl: item.externalUrl,
          });
        }
      },
    }),
    [savedSet, addSave, removeSave]
  );

  const cfg = active === 'all' ? null : CHIP_QUERY[active];

  const [fetchState, setFetchState] = useState<{
    items: DiscoverItem[];
    error: string | null;
    loading: boolean;
  }>({ items: [], error: null, loading: false });

  // Derived, not stored.
  const results = cfg ? fetchState.items : [];
  const error = cfg ? fetchState.error : null;
  const loading = cfg ? fetchState.loading : false;

  useEffect(() => {
    if (!cfg) return;

    let cancelled = false;

    const term = cfg.termSuffix ? `${city}${cfg.termSuffix}` : city;
    const fallback = defaultSearchDates();
    const args: Record<string, unknown> = {
      category: cfg.providerCategory,
      term,
      limit: 6,
      checkin: checkin ?? fallback.checkin,
      checkout: checkout ?? fallback.checkout,
      forceRefresh: refreshTick > 0,
    };
    if (coords?.lat !== undefined) args.lat = coords.lat;
    if (coords?.lng !== undefined) args.lng = coords.lng;

    if (cfg.providerCategory === 'fly') {
      if (!originIata) {
        setFetchState({
          items: [],
          loading: false,
          error: 'Set your home airport in Profile to see flight deals.',
        });
        return;
      }
      args.originIata = originIata;
      if (destinationIata) args.destinationIata = destinationIata;
    }

    setFetchState((s) => ({ ...s, loading: true, error: null }));

    (search(args as Parameters<typeof search>[0]) as Promise<DiscoverItem[]>)
      .then((items) => {
        if (cancelled) return;
        setFetchState({ items: items ?? [], loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setFetchState({
          items: [],
          loading: false,
          error: err instanceof Error ? err.message : 'Search failed',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [
    cfg,
    city,
    coords?.lat,
    coords?.lng,
    originIata,
    destinationIata,
    checkin,
    checkout,
    refreshTick,
    search,
  ]);

  const spin = useSharedValue(0);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  useEffect(() => {
    if (loading) {
      spin.value = 0;
      spin.value = withRepeat(
        withTiming(360, { duration: 800, easing: Easing.linear }),
        -1
      );
    } else {
      cancelAnimation(spin);
      spin.value = withTiming(360, {
        duration: 220,
        easing: Easing.out(Easing.ease),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleRefresh = useCallback(() => {
    setRefreshTick((n) => n + 1);
  }, []);

  const handleCardPress = useCallback(
    (item: DiscoverItem) => {
      if (item.provider === 'viator') {
        if (item.externalUrl) {
          openBrowserAsync(item.externalUrl, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          }).catch(() => {});
          return;
        }
        router.push({
          pathname: '/viator/[productCode]',
          params: { productCode: item.apiRef },
        });
        return;
      }
      if (item.provider === 'liteapi') {
        const fallback = defaultSearchDates();
        router.push({
          pathname: '/hotel/[hotelId]',
          params: {
            hotelId: item.apiRef,
            checkin: checkin ?? fallback.checkin,
            checkout: checkout ?? fallback.checkout,
            adults: '2',
          },
        });
        return;
      }
      if (item.externalUrl) {
        Linking.openURL(item.externalUrl).catch(() => {});
      }
    },
    [checkin, checkout]
  );

  const emptyBorderColor = isDark ? 'rgba(255,255,255,0.15)' : '#d1d5db';
  const emptyTextColor = isDark ? '#9ca3af' : '#6b7280';

  const renderHeader = showHeading ? (
    <View style={styles.headerRow}>
      <Text style={styles.headingText}>{heading}</Text>
      {active !== 'all' ? (
        <TouchableOpacity
          testID="refresh-recommendations-button"
          onPress={handleRefresh}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Refresh results">
          <Animated.View style={spinStyle}>
            <RefreshCcw size={18} color={colors.textColors.default} />
          </Animated.View>
        </TouchableOpacity>
      ) : null}
    </View>
  ) : null;

  return (
    <View>
      {renderHeader}
      <Spacer size={8} vertical />

      {/* Recommendation chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.chipScrollContent,
          { backgroundColor: colors.backgroundColors.default },
        ]}>
        {visibleCategories.map((c, idx) => {
          const isSelected = active === c.k;
          const isLast = idx === visibleCategories.length - 1;

          return (
            <Pressable
              key={c.k}
              testID="recommendation-chip-button"
              onPress={() => setActive(c.k)}
              accessibilityRole="button"
              accessibilityLabel={`${c.label} category`}
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.chip,
                isLast && styles.chipLast,
                {
                  backgroundColor: isSelected
                    ? colors.primaryColors.default
                    : colors.backgroundColors.subtle,
                  borderColor: isSelected
                    ? 'transparent'
                    : colors.borderColors.subtle,
                },
              ]}>
              <Text
                style={[
                  styles.chipText,
                  {
                    fontFamily: isSelected
                      ? AppFonts.bricolage.medium
                      : AppFonts.bricolage.regular,
                    color: isSelected ? '#fff' : colors.text,
                  },
                ]}>
                {c.emoji ? `${c.emoji} ` : ''}
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Spacer size={8} vertical />

      <View style={styles.body}>
        {error ? (
          <View style={[styles.emptyBox, { borderColor: emptyBorderColor }]}>
            <Text style={[styles.emptyText, { color: emptyTextColor }]}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={[
                styles.retryButton,
                { backgroundColor: colors.primaryColors.default },
              ]}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : active === 'all' ? (
          <Grid
            items={DISCOVER_SAMPLES.map(toDiscoverFromSample)}
            onCardPress={handleCardPress}
            saveControls={saveControls}
          />
        ) : loading ? (
          <SkeletonGrid />
        ) : results.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: emptyBorderColor }]}>
            <Text style={[styles.emptyText, { color: emptyTextColor }]}>
              No results for{' '}
              {DISCOVER_CATEGORIES.find((c) => c.k === active)?.label} near{' '}
              {city}.
            </Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={[
                styles.retryButton,
                { backgroundColor: colors.primaryColors.default },
              ]}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Grid
            items={results}
            onCardPress={handleCardPress}
            saveControls={saveControls}
          />
        )}
      </View>
    </View>
  );
}

function toDiscoverFromSample(
  d: (typeof DISCOVER_SAMPLES)[number]
): DiscoverItem {
  return {
    provider: 'static',
    apiRef: d.id,
    category: d.cat,
    title: d.title,
    description: d.desc,
    imageUrl: d.img,
    locationName: d.loc,
  };
}

function mapToSaveCategory(
  category: string
):
  | 'hotel'
  | 'flight'
  | 'tour'
  | 'activity'
  | 'restaurant'
  | 'event'
  | 'destination'
  | 'trip'
  | 'other' {
  switch (category) {
    case 'stay':
    case 'hotel':
      return 'hotel';
    case 'fly':
    case 'flight':
      return 'flight';
    case 'tour':
    case 'explore':
      return 'tour';
    case 'do':
    case 'adventure':
    case 'activity':
    case 'adv':
    case 'relax':
      return 'activity';
    case 'eat':
    case 'restaurant':
      return 'restaurant';
    case 'attend':
    case 'event':
      return 'event';
    case 'destination':
      return 'destination';
    case 'trip':
      return 'trip';
    default:
      return 'other';
  }
}

function Grid({
  items,
  onCardPress,
  saveControls,
}: {
  items: DiscoverItem[];
  onCardPress: (item: DiscoverItem) => void;
  saveControls: SaveControls;
}) {
  // Pair rows manually so we don't pay for FlashList here — Discover renders
  // inside the home ScrollView and a nested virtualised list breaks the
  // outer scroll. Up to 6 cards on non-"all" tabs keeps this cheap.
  const rows: DiscoverItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return (
    <View>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={[styles.gridRow]}>
          {row.map((item) => (
            <View
              key={`${item.provider}:${item.apiRef}`}
              style={styles.gridCell}>
              <DiscoverCard
                item={item}
                categoryLabel={
                  DISCOVER_CATEGORIES.find((c) => c.k === item.category)
                    ?.label ?? item.category
                }
                categoryEmoji={
                  DISCOVER_CATEGORIES.find((c) => c.k === item.category)?.emoji
                }
                onPress={() => onCardPress(item)}
                saveControls={saveControls}
              />
            </View>
          ))}
          {row.length === 1 ? <View style={styles.gridCell} /> : null}
        </View>
      ))}
    </View>
  );
}

function SkeletonGrid() {
  return (
    <View>
      <View style={[styles.gridRow, { marginBottom: GUTTER }]}>
        <SkeletonBox
          width={CARD_WIDTH}
          height={CARD_WIDTH * 1.25}
          borderRadius={16}
        />
        <SkeletonBox
          width={CARD_WIDTH}
          height={CARD_WIDTH * 1.25}
          borderRadius={16}
        />
      </View>
      <View style={styles.gridRow}>
        <SkeletonBox
          width={CARD_WIDTH}
          height={CARD_WIDTH * 1.25}
          borderRadius={16}
        />
        <SkeletonBox
          width={CARD_WIDTH}
          height={CARD_WIDTH * 1.25}
          borderRadius={16}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    // marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PADDING,
  },
  headingText: {
    fontFamily: AppFonts.bricolage.semiBold,
    fontSize: 18,
  },
  chipScrollContent: {
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 4,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipLast: {
    marginRight: 0,
  },
  chipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  body: {
    paddingHorizontal: SIDE_PADDING,
  },
  emptyBox: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 12.5,
  },
  retryButton: {
    marginTop: 12,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryText: {
    fontSize: 12,
    fontFamily: AppFonts.bricolage.semiBold,
    color: '#fff',
  },
  gridRow: {
    flexDirection: 'row',
    gap: GUTTER,
  },
  gridCell: {
    width: CARD_WIDTH,
  },
});
