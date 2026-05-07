import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
    originalPrice: originalPriceStr,
    currency,
    checkin,
    checkout,
    adults: adultsStr,
    tripId,
    eventId,
  } = useLocalSearchParams<{
    hotelId: string;
    hotelName: string;
    hotelThumb: string;
    offerId: string;
    roomName: string;
    boardName: string;
    price: string;
    /** Per-night MSRP / pre-discount price; rendered as red strikethrough. */
    originalPrice?: string;
    currency: string;
    checkin: string;
    checkout: string;
    adults: string;
    tripId: string;
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
  const originalPerNight = originalPriceStr ? parseFloat(originalPriceStr) : 0;
  // Only treat as a discount when the value plausibly beats the offer price.
  const hasDiscount = originalPerNight > pricePerNight && originalPerNight > 0;
  const originalTotal = hasDiscount ? originalPerNight * nights : 0;

  const fmt = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const startBookingAction = useAction(api.hotels.startBooking);
  const createPaymentIntent = useAction(api.payments.createPaymentIntent);

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
      const { clientSecret } = await createPaymentIntent({
        amount: Math.round(result.finalPrice * 100),
        currency: result.currency,
        description: `Hotel: ${hotelName}`,
        metadata: {
          kind: 'hotel_booking',
          bookingId: result.bookingId as unknown as string,
          hotelId,
          ...(tripId ? { tripId } : {}),
        },
      });
      router.push({
        pathname: '/hotel/payment',
        params: {
          hotelId,
          hotelName,
          hotelThumb,
          bookingId: result.bookingId as unknown as string,
          clientSecret,
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
      const msg =
        err instanceof Error
          ? err.message
          : 'This room could not be held. Please pick another or try again.';
      Alert.alert('Booking unavailable', msg);
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
              <Text style={[styles.priceRowText, { color: colors.textColors.subtle }]}>
                {currency} {pricePerNight.toFixed(0)} × {nights}{' '}
                {nights === 1 ? 'night' : 'nights'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                {hasDiscount ? (
                  <Text style={styles.originalPrice}>
                    {currency} {originalTotal.toFixed(0)}
                  </Text>
                ) : null}
                <Text style={styles.priceRowText}>
                  {currency} {totalPrice.toFixed(0)}
                </Text>
              </View>
            </View>
            {bookingType === 'group' && groupSize > 1 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceRowText, { color: colors.textColors.subtle }]}>
                  Rooms ({groupSize} guests)
                </Text>
                <Text style={styles.priceRowText}>{groupSize} rooms</Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                {hasDiscount ? (
                  <Text style={styles.originalPrice}>
                    {currency}{' '}
                    {(originalTotal * (bookingType === 'group' ? groupSize : 1)).toFixed(0)}
                  </Text>
                ) : null}
                <Text style={[styles.totalValue, { color: colors.textColors.default }]}>
                  {currency}{' '}
                  {(
                    totalPrice * (bookingType === 'group' ? groupSize : 1)
                  ).toFixed(0)}
                </Text>
              </View>
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
    ...textStyles.textHeading16,
    flex: 1,
    textAlign: 'center',
  },
  content: { paddingHorizontal: 16 },
  thumb: {
    height: 160,
    borderRadius: 12,
    width: '100%',
  },
  hotelName: { ...textStyles.textHeading20 },
  roomLabel: { ...textStyles.textBody14, marginTop: 3 },
  sectionLabel: { ...textStyles.textHeading16 },
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
    ...textStyles.textBody12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: { ...textStyles.textHeading16, marginTop: 2 },
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
  toggleText: { ...textStyles.textBody14 },
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
    gap: 10,
  },
  priceRowText: { ...textStyles.textBody14 },
  totalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  totalLabel: { ...textStyles.textHeading16 },
  totalValue: { ...textStyles.textHeading20 },
  // Strikethrough red — used next to the offer price when LiteAPI's
  // `suggestedSellingPrice` exposes a higher pre-discount total.
  originalPrice: {
    ...textStyles.textBody14,
    color: '#DA2020',
    textDecorationLine: 'line-through',
  },
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
  ctaBtnText: { ...textStyles.textHeading16, color: '#fff' },
});
