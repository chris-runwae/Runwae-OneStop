import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';
import { useAction } from 'convex/react';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacer, Text } from '@/components';
import PaymentErrorBanner from '@/components/payment/PaymentErrorBanner';
import { Colors, textStyles } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import * as Sentry from '@sentry/react-native';

// User-facing copy. Never surface raw Stripe / SDK error strings (e.g.
// "No such payment intent: pi_..."): they leak internals and mean nothing
// to a guest. Technical detail goes to Sentry instead.
const GENERIC_PAYMENT_ERROR =
  "Something went wrong with your payment. You haven't been charged. Please try again, or contact support if it keeps happening.";
const GENERIC_PAYMENT_INIT_ERROR =
  "We couldn't load the payment screen. Please go back and try again.";

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

// Base URL of apps/web, which hosts the LiteAPI Payment SDK wrapper page at
// /hotel-pay.html. Must be set in the app's env (e.g. EXPO_PUBLIC_WEB_URL).
const WEB_BASE_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? '').replace(/\/$/, '');
// LiteAPI environment for the SDK — must match the LITEAPI_KEY mode on the
// Convex backend ("sandbox" for sand_… keys, "live" for prod_… keys).
const LITEAPI_PAYMENT_ENV = process.env.EXPO_PUBLIC_LITEAPI_ENV ?? 'sandbox';

export default function PaymentScreen() {
  const {
    hotelId,
    hotelName,
    hotelThumb,
    bookingId,
    clientSecret,
    price: priceStr,
    currency,
    checkin,
    checkout,
    guests: guestsStr,
    bookingType,
    tripId,
    eventId,
  } = useLocalSearchParams<{
    hotelId: string;
    hotelName: string;
    hotelThumb: string;
    bookingId: string;
    clientSecret: string;
    price: string;
    currency: string;
    checkin: string;
    checkout: string;
    guests: string;
    bookingType: string;
    tripId: string;
    eventId?: string;
  }>();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const confirmAfterPayment = useAction(api.hotels.confirmAfterPayment);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);

  const price = parseFloat(priceStr ?? '0');
  const guests = parseInt(guestsStr ?? '1', 10);

  const priceLabel = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'GBP',
    maximumFractionDigits: 0,
  }).format(price);

  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Please fill in your name and email.');
      return;
    }
    if (!WEB_BASE_URL) {
      // EXPO_PUBLIC_WEB_URL not configured — the checkout page can't be reached.
      console.error('[PaymentFlow] EXPO_PUBLIC_WEB_URL is not set');
      Sentry.captureException(new Error('EXPO_PUBLIC_WEB_URL not set'), {
        tags: { feature: 'hotel_payment', stage: 'config' },
        extra: { bookingId },
      });
      setPayError(GENERIC_PAYMENT_INIT_ERROR);
      return;
    }
    if (!clientSecret) {
      setPayError(GENERIC_PAYMENT_INIT_ERROR);
      return;
    }

    setPayError(null);
    setLoading(true);
    setBookingStatus('Opening secure checkout…');

    try {
      // LiteAPI is merchant of record. The Stripe PaymentIntent lives in
      // LiteAPI's Stripe account, so payment is collected by LiteAPI's hosted
      // Payment SDK (liteAPIPayment.js) — loaded from apps/web/hotel-pay.html
      // in an in-app browser — NOT by @stripe/stripe-react-native (whose
      // publishable key can't see that PaymentIntent → "No such payment_intent").
      // App deep link we ultimately return to (e.g. runwae-dev://hotel-pay-return).
      const deepLink = Linking.createURL('hotel-pay-return');
      // LiteAPI redirects to this https bridge page, which bounces to deepLink.
      // Using https here avoids providers that reject custom-scheme returnUrls.
      const bridgeUrl =
        `${WEB_BASE_URL}/hotel-pay-return.html?to=${encodeURIComponent(deepLink)}`;
      const checkoutUrl =
        `${WEB_BASE_URL}/hotel-pay.html` +
        `#secretKey=${encodeURIComponent(clientSecret)}` +
        `&env=${encodeURIComponent(LITEAPI_PAYMENT_ENV)}` +
        `&returnUrl=${encodeURIComponent(bridgeUrl)}`;

      // openAuthSessionAsync watches for the custom scheme (deepLink) and
      // closes the in-app browser when the bridge page bounces to it.
      const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, deepLink);

      // Anything other than a redirect back to returnUrl means the user closed
      // the sheet without completing payment. Not an error — just bail.
      if (result.type !== 'success') {
        setBookingStatus(null);
        setLoading(false);
        return;
      }

      // The redirect to returnUrl fired, so LiteAPI captured the payment.
      // Finalize the reservation: confirmAfterPayment runs LiteAPI book()
      // (method=TRANSACTION) and flips the booking to confirmed. Idempotent:
      // safe to retry on network blips.
      setBookingStatus('Confirming reservation…');
      const confirmation = await confirmAfterPayment({
        bookingId: bookingId as unknown as Id<'bookings'>,
        holderFirstName: firstName.trim(),
        holderLastName: lastName.trim(),
        holderEmail: email.trim(),
      });

      router.replace({
        pathname: '/hotel/confirmation',
        params: {
          hotelName,
          hotelThumb,
          bookingRef: bookingId,
          confirmationCode: confirmation.confirmationCode ?? '',
          checkin,
          checkout,
          hotelId,
          tripId,
        },
      });
    } catch (err) {
      console.error('[PaymentFlow] Error:', err);
      Sentry.captureException(err, {
        tags: { feature: 'hotel_payment', stage: 'liteapi_payment_sdk' },
        extra: { bookingId },
      });
      setPayError(GENERIC_PAYMENT_ERROR);
    } finally {
      setLoading(false);
      setBookingStatus(null);
    }
  };

  const inputStyle = [
    styles.input,
    {
      borderColor: colorScheme === 'dark' ? '#374151' : '#E9ECEF',
      backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#F9FAFB',
      color: colors.textColors.default,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.backgroundColors.default }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: 24 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.textColors.default} />
        </Pressable>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Summary card */}
          <View
            style={[
              styles.summaryCard,
              { borderColor: colorScheme === 'dark' ? '#374151' : '#E9ECEF' },
            ]}>
            <Image
              source={{ uri: hotelThumb || FALLBACK_IMAGE }}
              style={styles.summaryThumb}
              contentFit="cover"
            />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryName} numberOfLines={2}>
                {hotelName}
              </Text>
              <Text
                style={[
                  styles.summaryDates,
                  { color: colors.textColors.subtle },
                ]}>
                {checkin} → {checkout}
              </Text>
              <Text style={styles.summaryPrice}>{priceLabel}</Text>
            </View>
          </View>

          <Spacer size={24} vertical />

          {/* Guest details */}
          <Text style={styles.sectionLabel}>Guest Details</Text>
          <Spacer size={12} vertical />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: colors.textColors.subtle },
                ]}>
                First Name
              </Text>
              <TextInput
                testID="guest-first-name"
                style={inputStyle}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="John"
                placeholderTextColor={colors.textColors.subtle}
                autoCorrect={false}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: colors.textColors.subtle },
                ]}>
                Last Name
              </Text>
              <TextInput
                testID="guest-last-name"
                style={inputStyle}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Doe"
                placeholderTextColor={colors.textColors.subtle}
                autoCorrect={false}
              />
            </View>
          </View>
          <Spacer size={10} vertical />
          <Text
            style={[styles.fieldLabel, { color: colors.textColors.subtle }]}>
            Email
          </Text>
          <TextInput
            testID="guest-email"
            style={inputStyle}
            value={email}
            onChangeText={setEmail}
            placeholder="john@example.com"
            placeholderTextColor={colors.textColors.subtle}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Spacer size={24} vertical />

          {/* Payment method note */}
          <View style={styles.paymentNote}>
            <CreditCard size={16} color="#FF1F8C" />
            <Text
              style={[
                styles.paymentNoteText,
                { color: colors.textColors.subtle },
              ]}>
              You&apos;ll complete payment in a secure checkout window. Cards
              accepted.
            </Text>
          </View>

          <Spacer size={32} vertical />
        </View>
      </ScrollView>

      {/* Sticky pay button */}
      <View
        style={[
          styles.cta,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: colors.backgroundColors.default,
            borderTopColor: colorScheme === 'dark' ? '#374151' : '#E9ECEF',
          },
        ]}>
        {payError ? (
          <PaymentErrorBanner
            message={payError}
            onDismiss={() => setPayError(null)}
          />
        ) : null}
        <View style={styles.secureRow}>
          <Lock size={12} color="#22C55E" />
          <Text style={styles.secureText}>Secured & encrypted</Text>
        </View>
        <Pressable
          testID="pay-button"
          style={[styles.payBtn, loading && { opacity: 0.7 }]}
          onPress={handlePay}
          disabled={loading}>
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator color="#fff" />
              {bookingStatus && (
                <Text style={[styles.payBtnText, { marginLeft: 10 }]}>
                  {bookingStatus}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.payBtnText}>Pay {priceLabel}</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  summaryCard: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  summaryThumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  summaryInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  summaryName: { ...textStyles.textHeading16 },
  summaryDates: { ...textStyles.textBody12 },
  summaryPrice: { ...textStyles.textHeading16 },
  sectionLabel: { ...textStyles.textHeading16 },
  row: { flexDirection: 'row', gap: 10 },
  fieldLabel: { ...textStyles.textBody12, marginBottom: 6 },
  input: {
    ...textStyles.textBody14,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  paymentNote: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: '#FF1F8C08',
    borderRadius: 10,
    padding: 12,
  },
  paymentNoteText: { ...textStyles.textBody12, flex: 1 },
  cta: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    justifyContent: 'center',
  },
  secureText: { ...textStyles.textBody12, color: '#22C55E' },
  payBtn: {
    backgroundColor: '#FF1F8C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payBtnText: { ...textStyles.textHeading16, color: '#fff' },
});
