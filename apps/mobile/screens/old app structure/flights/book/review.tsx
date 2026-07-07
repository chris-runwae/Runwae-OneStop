import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import SkeletonBox from '@/components/ui/SkeletonBox';
import { api } from '@runwae/convex/convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import { useTheme } from "expo-router/react-navigation";
import { useAction } from 'convex/react';
import { format, parseISO } from 'date-fns';
import { Image as ExpoImage } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight, Plane } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type OfferDetail = NonNullable<FunctionReturnType<typeof api.flights.getOffer>>;

export default function FlightReviewScreen() {
  const { dark } = useTheme();
  const params = useLocalSearchParams<{ offerId: string }>();
  const getOffer = useAction(api.flights.getOffer);

  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOffer({ apiRef: params.offerId })
      .then((o) => {
        if (cancelled) return;
        if (!o) {
          setError('This offer is no longer available.');
        } else {
          setOffer(o);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Could not load offer.',
          );
      });
    return () => {
      cancelled = true;
    };
  }, [getOffer, params.offerId]);

  const onContinue = () => {
    if (!offer) return;
    router.push({
      pathname: '/flights/book/passengers',
      params: { offerId: offer.apiRef },
    });
  };

  return (
    <AppSafeAreaView
      edges={['top']}
      style={{ backgroundColor: dark ? '#0d0d0d' : '#F8F9FA', flex: 1 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ArrowLeft size={20} color={dark ? '#fff' : '#000'} />
        </Pressable>
        <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>
          Review flight
        </Text>
      </View>

      {error ? (
        <View style={styles.empty}>
          <Text style={[styles.errorText, { color: dark ? '#fff' : '#000' }]}>
            {error}
          </Text>
        </View>
      ) : !offer ? (
        <View style={{ padding: 16, gap: 12 }}>
          <SkeletonBox width="100%" height={120} borderRadius={14} />
          <SkeletonBox width="100%" height={80} borderRadius={14} />
          <SkeletonBox width="100%" height={80} borderRadius={14} />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 14 }}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: dark ? '#1c1c1e' : '#ffffff',
                  borderColor: dark ? '#27272a' : '#E9ECEF',
                },
              ]}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.logoWrap,
                    { backgroundColor: dark ? '#0d0d0d' : '#FFE5F0' },
                  ]}>
                  {offer.carrierLogo ? (
                    <ExpoImage
                      source={{ uri: offer.carrierLogo }}
                      style={{ width: 32, height: 32 }}
                      contentFit="contain"
                    />
                  ) : (
                    <Plane size={20} color="#FF1F8C" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.carrier, { color: dark ? '#fff' : '#000' }]}>
                    {offer.carrier}
                  </Text>
                  <Text style={styles.passengerCount}>
                    {offer.passengers.length} passenger
                    {offer.passengers.length > 1 ? 's' : ''}
                  </Text>
                </View>
                <Text style={styles.price}>
                  {new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: offer.currency,
                    maximumFractionDigits: 2,
                  }).format(offer.totalAmount)}
                </Text>
              </View>
            </View>

            {offer.segments.map((seg, idx) => (
              <View
                key={`${seg.flightNumber}-${idx}`}
                style={[
                  styles.card,
                  {
                    backgroundColor: dark ? '#1c1c1e' : '#ffffff',
                    borderColor: dark ? '#27272a' : '#E9ECEF',
                  },
                ]}>
                <View style={styles.segRow}>
                  <Text style={[styles.iata, { color: dark ? '#fff' : '#000' }]}>
                    {seg.origin}
                  </Text>
                  <ArrowRight size={16} color="#9ca3af" />
                  <Text style={[styles.iata, { color: dark ? '#fff' : '#000' }]}>
                    {seg.destination}
                  </Text>
                </View>
                <Text style={styles.segMeta}>
                  {fmtTime(seg.depart)} → {fmtTime(seg.arrive)}
                </Text>
                <Text style={styles.segMeta}>
                  {seg.carrier} · {seg.flightNumber}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View
            style={[
              styles.cta,
              {
                backgroundColor: dark ? '#0d0d0d' : '#F8F9FA',
                borderTopColor: dark ? '#27272a' : '#E5E7EB',
              },
            ]}>
            <Pressable onPress={onContinue} style={styles.continueBtn}>
              <Text style={styles.continueBtnText}>Continue</Text>
              <ArrowRight size={18} color="#fff" />
            </Pressable>
          </View>
        </>
      )}
    </AppSafeAreaView>
  );
}

function fmtTime(iso: string): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'MMM d, HH:mm');
  } catch {
    return iso;
  }
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
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carrier: { fontSize: 16, fontWeight: '700' },
  passengerCount: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  price: { fontSize: 18, fontWeight: '800', color: '#FF1F8C' },
  segRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iata: { fontSize: 18, fontWeight: '800' },
  segMeta: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 14, textAlign: 'center' },
  cta: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FF1F8C',
    paddingVertical: 16,
    borderRadius: 999,
  },
  continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
