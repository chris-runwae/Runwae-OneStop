import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import SkeletonBox from '@/components/ui/SkeletonBox';
import { api } from '@runwae/convex/convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import { useTheme } from '@react-navigation/native';
import { useAction } from 'convex/react';
import { Image as ExpoImage } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight, Plane } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type FlightItem = FunctionReturnType<typeof api.flights.search>[number];

export default function FlightResultsScreen() {
  const { dark } = useTheme();
  const params = useLocalSearchParams<{
    originIata: string;
    destinationIata: string;
    depart: string;
    returnDate?: string;
    adults: string;
    tripType: string;
    originCity?: string;
    destinationCity?: string;
  }>();

  const search = useAction(api.flights.search);
  const [results, setResults] = useState<FlightItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setResults(null);
    setError(null);
    search({
      originIata: params.originIata,
      destinationIata: params.destinationIata,
      depart: params.depart,
      returnDate: params.returnDate,
      adults: Number(params.adults) || 1,
      sortBy: 'price_asc',
    })
      .then((items) => {
        if (!cancelled) setResults(items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load flights. Please try again.',
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    search,
    params.originIata,
    params.destinationIata,
    params.depart,
    params.returnDate,
    params.adults,
  ]);

  const subtitleParts = [
    params.depart,
    params.returnDate,
    `${params.adults} adult${Number(params.adults) > 1 ? 's' : ''}`,
  ].filter(Boolean);

  const titleColor = dark ? '#fff' : '#0F1115';
  const dividerColor = dark ? '#1f1f22' : '#EEF0F3';

  return (
    <AppSafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: dark ? '#0d0d0d' : '#F8F9FA' }}>
      <View
        style={[
          styles.header,
          { borderBottomColor: dividerColor },
        ]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={[
            styles.back,
            { backgroundColor: dark ? '#1c1c1e' : '#F1F3F5' },
          ]}>
          <ArrowLeft size={20} color={titleColor} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={[styles.titleIata, { color: titleColor }]}>
              {params.originIata}
            </Text>
            <ArrowRight size={16} color={dark ? '#9ca3af' : '#6B7280'} />
            <Text style={[styles.titleIata, { color: titleColor }]}>
              {params.destinationIata}
            </Text>
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitleParts.join(' · ')}
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.empty}>
          <Text style={[styles.errorText, { color: titleColor }]}>{error}</Text>
        </View>
      ) : results === null ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 22 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.skeletonRow}>
              <SkeletonBox width={36} height={36} borderRadius={10} />
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonBox width="65%" height={15} borderRadius={4} />
                <SkeletonBox width="45%" height={11} borderRadius={4} />
              </View>
              <SkeletonBox width={64} height={18} borderRadius={4} />
            </View>
          ))}
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.errorText, { color: titleColor }]}>
            No flights found for this route. Try different dates.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.apiRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          ItemSeparatorComponent={() => (
            <View
              style={[
                styles.separator,
                { backgroundColor: dividerColor },
              ]}
            />
          )}
          ListHeaderComponent={
            <Text style={[styles.resultsCount, { color: dark ? '#9ca3af' : '#6B7280' }]}>
              {results.length} flight{results.length === 1 ? '' : 's'}
              {' '}· sorted by price
            </Text>
          }
          renderItem={({ item, index }) => (
            <OfferRow
              item={item}
              dark={dark}
              index={index}
              onPress={() =>
                router.push({
                  pathname: '/flights/book/review',
                  params: {
                    offerId: item.apiRef,
                    originIata: params.originIata,
                    destinationIata: params.destinationIata,
                  },
                })
              }
            />
          )}
        />
      )}
    </AppSafeAreaView>
  );
}

function OfferRow({
  item,
  dark,
  index,
  onPress,
}: {
  item: FlightItem;
  dark: boolean;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const priceLabel =
    item.price != null && item.currency
      ? new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: item.currency,
          maximumFractionDigits: 0,
        }).format(item.price)
      : '—';

  return (
    <Animated.View
      entering={FadeInDown.duration(220).delay(Math.min(index * 28, 240))}
      style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.985, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        style={({ pressed }) => [
          styles.row,
          pressed && {
            backgroundColor: dark ? '#141416' : '#FAFBFC',
          },
        ]}>
        <View style={styles.logoWrap}>
          {item.imageUrl ? (
            <ExpoImage
              source={{ uri: item.imageUrl }}
              style={{ width: 28, height: 28 }}
              contentFit="contain"
            />
          ) : (
            <Plane size={18} color={dark ? '#fff' : '#0F1115'} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.title, { color: dark ? '#fff' : '#0F1115' }]}
            numberOfLines={1}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.sub} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.price, { color: dark ? '#fff' : '#0F1115' }]}>
          {priceLabel}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIata: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#9ca3af',
    marginTop: 4,
  },
  resultsCount: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  logoWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  sub: {
    fontSize: 12.5,
    color: '#9ca3af',
    marginTop: 3,
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: { fontSize: 14, textAlign: 'center' },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
});
