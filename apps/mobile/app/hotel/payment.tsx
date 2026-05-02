import { useStripeSafe } from "@/utils/stripe-safe";
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
import { Colors, textStyles } from '@/constants';
import { useAuth } from '@/context/AuthContext';

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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const price = parseFloat(priceStr ?? '0');
  const guests = parseInt(guestsStr ?? '1', 10);

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
            merchantIdentifier: 'merchant.io.runwae.app',
          },
          googlePay: { merchantCountryCode: 'GB', testEnv: __DEV__ },
          returnURL: 'runwae://stripe-redirect',
          style: 'automatic',
        });
        if (initErr) throw new Error(initErr.message);
        setPaymentReady(true);
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : 'Could not load payment. Please try again.';
        console.error('[Stripe] init failed:', e);
        setInitError(msg);
      }
    })();
  }, [clientSecret, initPaymentSheet]);

  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  const handlePay = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Please fill in your name and email.');
      return;
    }
    setLoading(true);
    setBookingStatus('Confirming payment...');
    
    try {
      // 1. Present Stripe Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();
      
      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          console.error('[Stripe] Payment presented error:', paymentError);
          Alert.alert(
            'Payment failed',
            paymentError.message || 'The payment could not be processed. Please check your card details.'
          );
        }
        setBookingStatus(null);
        setLoading(false);
        return;
      }

      // The Stripe webhook on the Convex backend
      // (api.payments + api.bookings.finalisePaidBooking) flips the
      // booking from "pending" to "confirmed" and persists every
      // detail; the client just needs to navigate forward once the
      // payment succeeds.
      router.replace({
        pathname: '/hotel/confirmation',
        params: {
          hotelName,
          hotelThumb,
          bookingRef: bookingId,
          confirmationCode: '',
          checkin,
          checkout,
          hotelId,
          tripId,
        },
      });
    } catch (err) {
      console.error('[PaymentFlow] Error:', err);
      // Main error handler for everything else
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
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
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
              <Text style={styles.summaryPrice}>
                {currency} {price.toFixed(0)}
              </Text>
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
              <Text style={styles.payBtnText}>
                Pay {currency} {price.toFixed(0)}
              </Text>
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
    ...textStyles.bold_20,
    fontSize: 16,
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
  summaryName: { ...textStyles.bold_20, fontSize: 14 },
  summaryDates: { fontSize: 12 },
  summaryPrice: { ...textStyles.bold_20, fontSize: 15, color: '#FF1F8C' },
  sectionLabel: { ...textStyles.bold_20, fontSize: 14 },
  row: { flexDirection: 'row', gap: 10 },
  fieldLabel: { fontSize: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  paymentNote: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: '#FF1F8C08',
    borderRadius: 10,
    padding: 12,
  },
  paymentNoteText: { fontSize: 12, flex: 1, lineHeight: 18 },
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
  secureText: { fontSize: 11, color: '#22C55E' },
  payBtn: {
    backgroundColor: '#FF1F8C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
