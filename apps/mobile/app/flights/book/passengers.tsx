import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { useAuth } from '@/context/AuthContext';
import { api } from '@runwae/convex/convex/_generated/api';
import { useTheme } from '@react-navigation/native';
import { useAction } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Title = 'mr' | 'ms' | 'mrs' | 'miss' | 'dr';
type Gender = 'm' | 'f';

type PassengerForm = {
  title: Title;
  firstName: string;
  lastName: string;
  gender: Gender;
  bornOn: string; // YYYY-MM-DD
  email: string;
  phoneE164: string;
};

const TITLES: Title[] = ['mr', 'ms', 'mrs', 'miss', 'dr'];
const DOB_RE = /^\d{4}-\d{2}-\d{2}$/;
const E164_RE = /^\+\d{7,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emptyPassenger(emailDefault?: string): PassengerForm {
  return {
    title: 'mr',
    firstName: '',
    lastName: '',
    gender: 'm',
    bornOn: '',
    email: emailDefault ?? '',
    phoneE164: '+',
  };
}

export default function FlightPassengersScreen() {
  const { dark } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ offerId: string }>();

  const startBooking = useAction(api.flights.startBooking);
  const createPaymentIntent = useAction(api.payments.createPaymentIntent);

  // Phase 1 supports only the 1-adult path (matching the picker). For
  // multi-passenger offers we still render N forms so the API contract holds.
  const [passengers, setPassengers] = useState<PassengerForm[]>([
    emptyPassenger(user?.email),
  ]);
  const [submitting, setSubmitting] = useState(false);

  const isValid = useMemo(
    () =>
      passengers.every(
        (p) =>
          p.firstName.trim().length > 0 &&
          p.lastName.trim().length > 0 &&
          DOB_RE.test(p.bornOn) &&
          EMAIL_RE.test(p.email.trim()) &&
          E164_RE.test(p.phoneE164.trim()),
      ),
    [passengers],
  );

  const updatePassenger = (idx: number, patch: Partial<PassengerForm>) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    );
  };

  const onPay = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const result = await startBooking({
        offerId: params.offerId,
        passengers: passengers.map((p) => ({
          duffelId: '',
          title: p.title,
          firstName: p.firstName.trim(),
          lastName: p.lastName.trim(),
          gender: p.gender,
          bornOn: p.bornOn.trim(),
          email: p.email.trim(),
          phoneE164: p.phoneE164.trim(),
        })),
      });

      const { clientSecret } = await createPaymentIntent({
        // Stripe needs minor units. Duffel quotes in major units (e.g. 234.50).
        amount: Math.round(result.totalAmount * 100),
        currency: result.currency,
        description: `Flight: ${result.summary}`,
        metadata: {
          kind: 'flight_booking',
          bookingId: result.bookingId as unknown as string,
        },
      });

      router.replace({
        pathname: '/flights/book/payment',
        params: {
          bookingId: result.bookingId as unknown as string,
          clientSecret,
          totalAmount: String(result.totalAmount),
          currency: result.currency,
          summary: result.summary,
        },
      });
    } catch (err) {
      Alert.alert(
        'Could not start booking',
        err instanceof Error ? err.message : 'Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppSafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: dark ? '#0d0d0d' : '#F8F9FA' }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ArrowLeft size={20} color={dark ? '#fff' : '#000'} />
        </Pressable>
        <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>
          Passenger details
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 18 }}>
          {passengers.map((p, idx) => (
            <View
              key={idx}
              style={[
                styles.card,
                {
                  backgroundColor: dark ? '#1c1c1e' : '#ffffff',
                  borderColor: dark ? '#27272a' : '#E9ECEF',
                },
              ]}>
              <Text
                style={[styles.cardTitle, { color: dark ? '#fff' : '#000' }]}>
                Passenger {idx + 1}
              </Text>

              <Text style={styles.fieldLabel}>Title</Text>
              <View style={styles.titleRow}>
                {TITLES.map((t) => {
                  const active = p.title === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => updatePassenger(idx, { title: t })}
                      style={[
                        styles.titlePill,
                        {
                          backgroundColor: active
                            ? '#FF1F8C'
                            : dark
                              ? '#0d0d0d'
                              : '#f3f4f6',
                        },
                      ]}>
                      <Text
                        style={{
                          color: active
                            ? '#fff'
                            : dark
                              ? '#9ca3af'
                              : '#6b7280',
                          fontWeight: active ? '700' : '500',
                          fontSize: 13,
                          textTransform: 'capitalize',
                        }}>
                        {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>First name</Text>
                  <TextInput
                    value={p.firstName}
                    onChangeText={(v) => updatePassenger(idx, { firstName: v })}
                    placeholder="First"
                    placeholderTextColor="#9ca3af"
                    autoCorrect={false}
                    autoCapitalize="words"
                    style={inputStyle(dark)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Last name</Text>
                  <TextInput
                    value={p.lastName}
                    onChangeText={(v) => updatePassenger(idx, { lastName: v })}
                    placeholder="Last"
                    placeholderTextColor="#9ca3af"
                    autoCorrect={false}
                    autoCapitalize="words"
                    style={inputStyle(dark)}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.row}>
                {(['m', 'f'] as Gender[]).map((g) => {
                  const active = p.gender === g;
                  return (
                    <Pressable
                      key={g}
                      onPress={() => updatePassenger(idx, { gender: g })}
                      style={[
                        styles.genderPill,
                        {
                          backgroundColor: active
                            ? '#FF1F8C'
                            : dark
                              ? '#0d0d0d'
                              : '#f3f4f6',
                        },
                      ]}>
                      <Text
                        style={{
                          color: active
                            ? '#fff'
                            : dark
                              ? '#9ca3af'
                              : '#6b7280',
                          fontWeight: active ? '700' : '500',
                          fontSize: 13,
                        }}>
                        {g === 'm' ? 'Male' : 'Female'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Date of birth</Text>
              <TextInput
                value={p.bornOn}
                onChangeText={(v) => updatePassenger(idx, { bornOn: v })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                autoCorrect={false}
                style={inputStyle(dark)}
              />

              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                value={p.email}
                onChangeText={(v) => updatePassenger(idx, { email: v })}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="email-address"
                style={inputStyle(dark)}
              />

              <Text style={styles.fieldLabel}>Phone (E.164)</Text>
              <TextInput
                value={p.phoneE164}
                onChangeText={(v) => updatePassenger(idx, { phoneE164: v })}
                placeholder="+447123456789"
                placeholderTextColor="#9ca3af"
                autoCorrect={false}
                keyboardType="phone-pad"
                style={inputStyle(dark)}
              />
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
          <Pressable
            onPress={onPay}
            disabled={!isValid || submitting}
            style={[
              styles.payBtn,
              { opacity: isValid && !submitting ? 1 : 0.5 },
            ]}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payBtnText}>Continue to payment</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </AppSafeAreaView>
  );
}

function inputStyle(dark: boolean) {
  return {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 6,
    borderColor: dark ? '#27272a' : '#E5E7EB',
    backgroundColor: dark ? '#0d0d0d' : '#ffffff',
    color: dark ? '#ffffff' : '#000000',
  };
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
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  fieldLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 6,
    marginTop: 8,
  },
  row: { flexDirection: 'row', gap: 10 },
  titleRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  titlePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  genderPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 999,
  },
  cta: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  payBtn: {
    backgroundColor: '#FF1F8C',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
