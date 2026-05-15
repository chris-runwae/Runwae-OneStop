import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import PaymentErrorBanner from '@/components/payment/PaymentErrorBanner';
import { useStripeSafe } from '@/utils/stripe-safe';
import { useTheme } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FlightPaymentScreen() {
  const { dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { initPaymentSheet, presentPaymentSheet } = useStripeSafe();

  const params = useLocalSearchParams<{
    bookingId: string;
    clientSecret: string;
    totalAmount: string;
    currency: string;
    summary: string;
  }>();

  const totalAmount = Number(params.totalAmount) || 0;

  const [paymentReady, setPaymentReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.clientSecret) return;
    (async () => {
      try {
        const { error: initErr } = await initPaymentSheet({
          merchantDisplayName: 'Runwae',
          paymentIntentClientSecret: params.clientSecret,
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
        console.error('[Stripe] flight init failed:', e);
        setInitError(msg);
      }
    })();
  }, [params.clientSecret, initPaymentSheet]);

  const handlePay = async () => {
    setPayError(null);
    setLoading(true);
    try {
      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          setPayError(
            paymentError.message ||
              'The payment could not be processed. Please check your card details.',
          );
        }
        setLoading(false);
        return;
      }

      // Stripe webhook → bookings.confirmByPaymentIntent →
      // internal.flights.finalisePaidBooking handles the rest. The mobile
      // confirmation screen polls for the Duffel PNR.
      router.replace({
        pathname: '/flights/book/confirmation',
        params: {
          bookingId: params.bookingId,
          totalAmount: params.totalAmount,
          currency: params.currency,
          summary: params.summary,
        },
      });
    } catch (err) {
      console.error('[FlightPayment] error:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Something went wrong while processing your payment. Your card was not charged. Please try again.';
      setPayError(msg);
    } finally {
      setLoading(false);
    }
  };

  const priceLabel = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: params.currency || 'GBP',
    maximumFractionDigits: 2,
  }).format(totalAmount);

  return (
    <AppSafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: dark ? '#0d0d0d' : '#F8F9FA' }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ArrowLeft size={20} color={dark ? '#fff' : '#000'} />
        </Pressable>
        <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>
          Payment
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View
          style={[
            styles.summary,
            {
              backgroundColor: dark ? '#1c1c1e' : '#ffffff',
              borderColor: dark ? '#27272a' : '#E9ECEF',
            },
          ]}>
          <Text style={[styles.summaryTitle, { color: dark ? '#fff' : '#000' }]}>
            Flight summary
          </Text>
          <Text style={styles.summaryDetails}>{params.summary}</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{priceLabel}</Text>
          </View>
        </View>

        <View
          style={[
            styles.note,
            { backgroundColor: dark ? '#1c1c1e' : '#FFE5F005' },
          ]}>
          <CreditCard size={16} color="#FF1F8C" />
          <Text style={styles.noteText}>
            Payments secured by Stripe. Supports Apple Pay & Google Pay.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.cta,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: dark ? '#0d0d0d' : '#F8F9FA',
            borderTopColor: dark ? '#27272a' : '#E5E7EB',
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
          <Text style={[styles.errorText]}>{initError}</Text>
        ) : (
          <Pressable
            style={[
              styles.payBtn,
              (!paymentReady || loading) && { opacity: 0.7 },
            ]}
            onPress={handlePay}
            disabled={!paymentReady || loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : !paymentReady ? (
              <Text style={styles.payBtnText}>Loading payment…</Text>
            ) : (
              <Text style={styles.payBtnText}>Pay {priceLabel}</Text>
            )}
          </Pressable>
        )}
      </View>
    </AppSafeAreaView>
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
  summary: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700' },
  summaryDetails: { color: '#9ca3af', fontSize: 13, marginTop: 6 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#33333322',
  },
  totalLabel: { fontSize: 14, color: '#9ca3af' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#FF1F8C' },
  note: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
  },
  noteText: { flex: 1, fontSize: 12, color: '#9ca3af', lineHeight: 18 },
  cta: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  secureText: { fontSize: 11, color: '#22C55E' },
  payBtn: {
    backgroundColor: '#FF1F8C',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
