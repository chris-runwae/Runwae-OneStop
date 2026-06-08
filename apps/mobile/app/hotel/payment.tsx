import { STRIPE_MERCHANT_IDENTIFIER, useStripeSafe } from '@/utils/stripe-safe';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';
import { useAction } from 'convex/react';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
  const { initPaymentSheet, presentPaymentSheet } = useStripeSafe();
  const confirmAfterPayment = useAction(api.hotels.confirmAfterPayment);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const price = parseFloat(priceStr ?? '0');
  const guests = parseInt(guestsStr ?? '1', 10);

  const priceLabel = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'GBP',
    maximumFractionDigits: 0,
  }).format(price);

  // The hotel-booking flow now begins on the Convex backend
  // (`api.hotels.startBooking`), which returns a Stripe PaymentIntent
  // client_secret. Initialise the Payment Sheet against that secret.
  useEffect(() => {
    if (!clientSecret) return;
    (async () => {
      try {
        const { error: initErr } = await initPaymentSheet({
          merchantDisplayName: 'Runwae',
          paymentIntentClientSecret: clientSecret,
          applePay: {
            merchantCountryCode: 'GB',
            merchantIdentifier: STRIPE_MERCHANT_IDENTIFIER,
          },
          googlePay: { merchantCountryCode: 'GB', testEnv: __DEV__ },
          returnURL: 'runwae://stripe-redirect',
          style: 'automatic',
        });
        if (initErr) throw new Error(initErr.message);
        setPaymentReady(true);
      } catch (e) {
        console.error('[Stripe] init failed:', e);
        Sentry.captureException(e, {
          tags: { feature: 'hotel_payment', stage: 'init_payment_sheet' },
          extra: { bookingId },
        });
        setInitError(GENERIC_PAYMENT_INIT_ERROR);
      }
    })();
  }, [clientSecret, initPaymentSheet]);

  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Please fill in your name and email.');
      return;
    }
    setPayError(null);
    setLoading(true);
    setBookingStatus('Confirming payment...');

    try {
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          console.error('[Stripe] Payment presented error:', paymentError);
          Sentry.captureException(
            new Error(`Stripe payment sheet error: ${paymentError.message}`),
            {
              tags: { feature: 'hotel_payment', stage: 'present_payment_sheet' },
              extra: {
                bookingId,
                stripeCode: paymentError.code,
                stripeMessage: paymentError.message,
              },
            },
          );
          setPayError(GENERIC_PAYMENT_ERROR);
        }
        setBookingStatus(null);
        setLoading(false);
        return;
      }

      // LiteAPI is merchant of record (Payment SDK mode), so Runwae's
      // Stripe webhook does not fire for these payments. Call the
      // confirmation action directly — it runs LiteAPI book() and flips
      // the booking to confirmed. Idempotent: safe to retry on network
      // blips.
      setBookingStatus('Confirming reservation...');
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
        tags: { feature: 'hotel_payment', stage: 'confirm_after_payment' },
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
              Payments secured by Stripe. Supports Apple Pay & Google Pay.
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
        {initError ? (
          <Text style={[styles.payBtnText, { color: '#EF4444', fontSize: 13 }]}>
            {initError}
          </Text>
        ) : (
          <Pressable
            style={[
              styles.payBtn,
              (!paymentReady || loading) && { opacity: 0.7 },
            ]}
            onPress={handlePay}
            disabled={!paymentReady || loading}>
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color="#fff" />
                {bookingStatus && (
                  <Text style={[styles.payBtnText, { marginLeft: 10 }]}>
                    {bookingStatus}
                  </Text>
                )}
              </View>
            ) : !paymentReady ? (
              <Text style={styles.payBtnText}>Loading payment...</Text>
            ) : (
              <Text style={styles.payBtnText}>Pay {priceLabel}</Text>
            )}
          </Pressable>
        )}
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
