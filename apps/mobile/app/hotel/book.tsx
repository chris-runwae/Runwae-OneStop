import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacer, Text } from '@/components';
import { Colors, textStyles } from '@/constants';
import { useTrips } from '@/context/TripsContext';
import { useAction } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

export default function BookingScreen() {
  const {
    hotelId,
    hotelName,
    hotelThumb,
    offerId,
    roomName,
    boardName,
    price: priceStr,
    currency,
    checkin,
    checkout,
    adults: adultsStr,
    tripId,
    rateId,
    eventId,
  } = useLocalSearchParams<{
    hotelId: string;
    hotelName: string;
    hotelThumb: string;
    offerId: string;
    roomName: string;
    boardName: string;
    price: string;
    currency: string;
    checkin: string;
    checkout: string;
    adults: string;
    tripId: string;
    /** Carried from room selection for reconciliation with the vendor rate. */
    rateId?: string;
    eventId?: string;
  }>();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const { activeTripMembers } = useTrips();
  const groupSize = activeTripMembers.length || 1;
  const isGroupTrip = groupSize > 1;

  const baseAdults = parseInt(adultsStr ?? '1', 10);
  const [bookingType, setBookingType] = useState<'individual' | 'group'>(
    isGroupTrip ? 'group' : 'individual'
  );
  const [loading, setLoading] = useState(false);

  const effectiveAdults = bookingType === 'group' ? groupSize : 1;
  const nights = (() => {
    const a = new Date(checkin);
    const b = new Date(checkout);
    return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000));
  })();
  const pricePerNight = parseFloat(priceStr ?? '0');
  const totalPrice = pricePerNight * nights;

  const fmt = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const startBookingAction = useAction(api.hotels.startBooking);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const result = await startBookingAction({
        apiRef: hotelId,
        offerId,
        hotelName,
        checkin,
        checkout,
        ...(eventId ? { eventId: eventId as unknown as Id<'events'> } : {}),
      });
      // The Stripe PaymentIntent for the hotel sheet ships in Phase 8
      // alongside `payments.createPaymentIntent`. Until then the
      // payment screen renders without a real client_secret.
      router.push({
        pathname: '/hotel/payment',
        params: {
          hotelId,
          hotelName,
          hotelThumb,
          bookingId: result.bookingId as unknown as string,
          clientSecret: '',
          price: String(result.finalPrice),
          currency: result.currency,
          checkin,
          checkout,
          guests: String(effectiveAdults),
          bookingType,
          tripId,
          ...(eventId ? { eventId } : {}),
        },
      });
    } catch (err) {
      console.error('Prebook failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundColors.default },
      ]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.textColors.default} />
        </Pressable>
        <Text style={styles.headerTitle}>Booking Summary</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hotel thumbnail + name */}
          <Image
            source={{ uri: hotelThumb || FALLBACK_IMAGE }}
            style={styles.thumb}
            contentFit="cover"
          />
          <Spacer size={14} vertical />
          <Text style={styles.hotelName}>{hotelName}</Text>
          <Text style={[styles.roomLabel, { color: colors.textColors.subtle }]}>
            {roomName} · {boardName}
          </Text>
          {rateId ? (
            <>
              <Spacer size={8} vertical />
              <Text
                selectable
                style={{ fontSize: 10, color: colors.textColors.subtle }}
                numberOfLines={4}>
                Rate ID: {rateId}
              </Text>
            </>
          ) : null}
          {offerId ? (
            <>
              <Spacer size={6} vertical />
              <Text
                selectable
                style={{ fontSize: 10, color: colors.textColors.subtle }}
                numberOfLines={4}>
                Offer ID: {offerId}
              </Text>
            </>
          ) : null}

          <Spacer size={20} vertical />

          {/* Dates */}
          <View
            style={[
              styles.infoCard,
              {
                borderColor: colorScheme === 'dark' ? '#374151' : '#E9ECEF',
              },
            ]}>
            <View style={styles.infoRow}>
              <Calendar size={16} color="#FF1F8C" />
              <View>
                <Text style={styles.infoLabel}>Check-in</Text>
                <Text style={styles.infoValue}>{fmt(checkin)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Calendar size={16} color="#FF1F8C" />
              <View>
                <Text style={styles.infoLabel}>Check-out</Text>
                <Text style={styles.infoValue}>{fmt(checkout)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Users size={16} color="#FF1F8C" />
              <View>
                <Text style={styles.infoLabel}>Guests</Text>
                <Text style={styles.infoValue}>
                  {effectiveAdults} {effectiveAdults === 1 ? 'adult' : 'adults'}
                </Text>
              </View>
            </View>
          </View>

          <Spacer size={20} vertical />

          {/* Group / Individual toggle */}
          {isGroupTrip && (
            <>
              <Text style={styles.sectionLabel}>Who&apos;s booking?</Text>
              <Spacer size={10} vertical />
              <View style={styles.toggleRow}>
                {(['individual', 'group'] as const).map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.toggleBtn,
                      bookingType === type && styles.toggleBtnActive,
                      {
                        borderColor:
                          bookingType === type
                            ? '#FF1F8C'
                            : colorScheme === 'dark'
                              ? '#374151'
                              : '#E9ECEF',
                      },
                    ]}
                    onPress={() => setBookingType(type)}>
                    <Text
                      style={[
                        styles.toggleText,
                        bookingType === type && styles.toggleTextActive,
                        {
                          color:
                            bookingType === type
                              ? '#FF1F8C'
                              : colors.textColors.subtle,
                        },
                      ]}>
                      {type === 'individual'
                        ? 'Just me'
                        : `Group (${groupSize} people)`}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Spacer size={20} vertical />
            </>
          )}

          {/* Price breakdown */}
          <Text style={styles.sectionLabel}>Price Breakdown</Text>
          <Spacer size={12} vertical />
          <View
            style={[
              styles.priceCard,
              {
                borderColor: colorScheme === 'dark' ? '#374151' : '#E9ECEF',
              },
            ]}>
            <View style={styles.priceRow}>
              <Text style={{ color: colors.textColors.subtle }}>
                {currency} {pricePerNight.toFixed(0)} × {nights}{' '}
                {nights === 1 ? 'night' : 'nights'}
              </Text>
              <Text>
                {currency} {totalPrice.toFixed(0)}
              </Text>
            </View>
            {bookingType === 'group' && groupSize > 1 && (
              <View style={styles.priceRow}>
                <Text style={{ color: colors.textColors.subtle }}>
                  Rooms ({groupSize} guests)
                </Text>
                <Text>{groupSize} rooms</Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {currency}{' '}
                {(
                  totalPrice * (bookingType === 'group' ? groupSize : 1)
                ).toFixed(0)}
              </Text>
            </View>
          </View>

          <Spacer size={32} vertical />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={[
          styles.cta,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: colors.backgroundColors.default,
            borderTopColor: colorScheme === 'dark' ? '#374151' : '#E9ECEF',
          },
        ]}>
        <Pressable
          style={[styles.ctaBtn, loading && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaBtnText}>Confirm & Pay</Text>
          )}
        </Pressable>
      </View>
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
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyles.bold_20,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  content: { paddingHorizontal: 16 },
  thumb: {
    height: 160,
    borderRadius: 12,
    width: '100%',
  },
  hotelName: { ...textStyles.bold_20, fontSize: 18 },
  roomLabel: { ...textStyles.regular_14, fontSize: 13, marginTop: 3 },
  sectionLabel: { ...textStyles.bold_20, fontSize: 14 },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  infoLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#FF1F8C',
  },
  infoValue: { ...textStyles.bold_20, fontSize: 14, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#E9ECEF' },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: '#FF1F8C10' },
  toggleText: { fontSize: 13 },
  toggleTextActive: { fontWeight: '700' },
  priceCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  totalLabel: { ...textStyles.bold_20, fontSize: 14 },
  totalValue: { ...textStyles.bold_20, fontSize: 16, color: '#FF1F8C' },
  cta: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  ctaBtn: {
    backgroundColor: '#FF1F8C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
