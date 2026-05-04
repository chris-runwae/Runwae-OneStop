import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import SkeletonBox from '@/components/ui/SkeletonBox';
import { api } from '@runwae/convex/convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import { useTheme } from '@react-navigation/native';
import { useAction } from 'convex/react';
import { Image as ExpoImage } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plane } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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

  return (
    <AppSafeAreaView
      edges={['top']}
      style={{ backgroundColor: dark ? '#0d0d0d' : '#F8F9FA' }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ArrowLeft size={20} color={dark ? '#fff' : '#000'} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>
            {params.originCity || params.originIata} →{' '}
            {params.destinationCity || params.destinationIata}
          </Text>
          <Text style={styles.subtitle}>
            {params.depart}
            {params.returnDate ? ` · ${params.returnDate}` : ''} ·{' '}
            {params.adults} adult{Number(params.adults) > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.empty}>
          <Text style={[styles.errorText, { color: dark ? '#fff' : '#000' }]}>
            {error}
          </Text>
        </View>
      ) : results === null ? (
        <View style={{ padding: 16, gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.skeletonCard,
                { backgroundColor: dark ? '#1c1c1e' : '#ffffff' },
              ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <SkeletonBox width={40} height={40} borderRadius={20} />
                <View style={{ flex: 1, gap: 6 }}>
                  <SkeletonBox width="70%" height={16} borderRadius={4} />
                  <SkeletonBox width="50%" height={12} borderRadius={4} />
                </View>
                <SkeletonBox width={80} height={20} borderRadius={6} />
              </View>
            </View>
          ))}
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.errorText, { color: dark ? '#fff' : '#000' }]}>
            No flights found for this route. Try different dates.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.apiRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
          renderItem={({ item }) => (
            <OfferCard
              item={item}
              dark={dark}
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

function OfferCard({
  item,
  dark,
  onPress,
}: {
  item: FlightItem;
  dark: boolean;
  onPress: () => void;
}) {
  const priceLabel =
    item.price != null && item.currency
      ? new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: item.currency,
          maximumFractionDigits: 0,
        }).format(item.price)
      : '—';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: dark ? '#1c1c1e' : '#ffffff',
          borderColor: dark ? '#27272a' : '#E9ECEF',
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      <View style={styles.cardTop}>
        <View
          style={[
            styles.logoWrap,
            { backgroundColor: dark ? '#0d0d0d' : '#FFE5F0' },
          ]}>
          {item.imageUrl ? (
            <ExpoImage
              source={{ uri: item.imageUrl }}
              style={{ width: 28, height: 28 }}
              contentFit="contain"
            />
          ) : (
            <Plane size={18} color="#FF1F8C" />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.cardTitle, { color: dark ? '#fff' : '#000' }]}
            numberOfLines={1}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.cardSub} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <Text style={styles.price}>{priceLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#33333322',
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSub: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  price: { fontSize: 17, fontWeight: '800', color: '#FF1F8C' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 14, textAlign: 'center' },
  skeletonCard: {
    borderRadius: 14,
    padding: 14,
  },
});
