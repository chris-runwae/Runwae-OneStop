import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';
import { useTheme } from "expo-router/react-navigation";
import { useQuery } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function FlightConfirmationScreen() {
  const { dark } = useTheme();
  const params = useLocalSearchParams<{
    bookingId: string;
    totalAmount: string;
    currency: string;
    summary: string;
  }>();

  const booking = useQuery(api.bookings.getById, {
    bookingId: params.bookingId as Id<'bookings'>,
  });
  const bookingRef =
    (booking?.rawResponse as { duffelBookingReference?: string } | undefined)
      ?.duffelBookingReference ?? null;

  const onClose = () => {
    // Dismiss the entire flights modal stack.
    router.dismissAll();
  };

  const priceLabel = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: params.currency || 'GBP',
    maximumFractionDigits: 2,
  }).format(Number(params.totalAmount) || 0);

  return (
    <AppSafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: dark ? '#0d0d0d' : '#F8F9FA' }}>
      <View style={styles.headerRow}>
        <View style={{ width: 36 }} />
        <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
          <X size={20} color={dark ? '#fff' : '#000'} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.iconRing,
            { backgroundColor: dark ? '#1c1c1e' : '#FFE5F0' },
          ]}>
          <Text style={styles.emoji}>🎉</Text>
        </View>
        <Text style={[styles.heading, { color: dark ? '#fff' : '#000' }]}>
          You&apos;re booked!
        </Text>
        <Text style={styles.subheading}>
          {params.summary} · {priceLabel}
        </Text>

        <View
          style={[
            styles.refCard,
            {
              backgroundColor: dark ? '#1c1c1e' : '#ffffff',
              borderColor: dark ? '#27272a' : '#E9ECEF',
            },
          ]}>
          <Text style={styles.refLabel}>Booking reference</Text>
          <Text style={[styles.refValue, { color: dark ? '#fff' : '#000' }]}>
            {bookingRef ?? 'Confirming with the airline…'}
          </Text>
          {!bookingRef ? (
            <Text style={styles.refHint}>
              Your seat is paid for. The airline PNR usually appears within a
              few seconds.
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.cta}>
        <Pressable onPress={onClose} style={styles.doneBtn}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </View>
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 56, lineHeight: 64 },
  heading: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subheading: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  refCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    marginTop: 8,
    alignItems: 'center',
  },
  refLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 6 },
  refValue: { fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  refHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  cta: { padding: 16, paddingBottom: 32 },
  doneBtn: {
    backgroundColor: '#FF1F8C',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
