import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { useAuth } from '@/context/AuthContext';
import { api } from '@runwae/convex/convex/_generated/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@react-navigation/native';
import { useAction } from 'convex/react';
import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar as CalendarIcon, ChevronDown } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
const PINK = '#FF1F8C';

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

function sanitisePhone(input: string): string {
  // Always start with a single '+', then digits only. Strip everything else.
  const digits = input.replace(/[^\d]/g, '');
  return `+${digits}`.slice(0, 16);
}

export default function FlightPassengersScreen() {
  const { dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ offerId: string }>();

  const startBooking = useAction(api.flights.startBooking);
  const createPaymentIntent = useAction(api.payments.createPaymentIntent);

  const [passengers, setPassengers] = useState<PassengerForm[]>([
    emptyPassenger(user?.email),
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [datePickerFor, setDatePickerFor] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

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
    Keyboard.dismiss();
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

  const cardBg = dark ? '#1c1c1e' : '#ffffff';
  const borderClr = dark ? '#27272a' : '#EEF0F3';

  return (
    <AppSafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: dark ? '#0d0d0d' : '#F8F9FA' }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <ArrowLeft size={20} color={dark ? '#fff' : '#000'} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: dark ? '#fff' : '#0F1115' }]}>
            Passenger details
          </Text>
          <Text style={styles.subtitle}>
            Names must match the passport exactly.
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 18,
            paddingBottom: 24,
            gap: 18,
          }}
          showsVerticalScrollIndicator={false}>
          <Pressable onPress={Keyboard.dismiss} style={{ gap: 18 }}>
            {passengers.map((p, idx) => (
              <Animated.View
                key={idx}
                entering={FadeInDown.duration(280).delay(idx * 60)}
                layout={LinearTransition.springify().damping(18).stiffness(180)}
                style={[
                  styles.card,
                  {
                    backgroundColor: cardBg,
                    borderColor: borderClr,
                  },
                ]}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.passengerBadge,
                      { backgroundColor: dark ? '#2A0F1B' : '#FFF0F7' },
                    ]}>
                    <Text style={styles.passengerBadgeText}>{idx + 1}</Text>
                  </View>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: dark ? '#fff' : '#0F1115' },
                    ]}>
                    Passenger {idx + 1}
                  </Text>
                </View>

                <FieldGroup label="Title">
                  <View style={styles.titleRow}>
                    {TITLES.map((t) => (
                      <SelectablePill
                        key={t}
                        active={p.title === t}
                        onPress={() => updatePassenger(idx, { title: t })}
                        label={t.charAt(0).toUpperCase() + t.slice(1)}
                        dark={dark}
                      />
                    ))}
                  </View>
                </FieldGroup>

                <View style={styles.row}>
                  <FieldGroup label="First name" style={{ flex: 1 }}>
                    <Input
                      value={p.firstName}
                      onChangeText={(v) =>
                        updatePassenger(idx, { firstName: v })
                      }
                      placeholder="First"
                      dark={dark}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </FieldGroup>
                  <FieldGroup label="Last name" style={{ flex: 1 }}>
                    <Input
                      value={p.lastName}
                      onChangeText={(v) =>
                        updatePassenger(idx, { lastName: v })
                      }
                      placeholder="Last"
                      dark={dark}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </FieldGroup>
                </View>

                <FieldGroup label="Gender">
                  <View style={styles.row}>
                    {(['m', 'f'] as Gender[]).map((g) => (
                      <SelectablePill
                        key={g}
                        active={p.gender === g}
                        onPress={() => updatePassenger(idx, { gender: g })}
                        label={g === 'm' ? 'Male' : 'Female'}
                        dark={dark}
                        flex
                      />
                    ))}
                  </View>
                </FieldGroup>

                <FieldGroup label="Date of birth">
                  <Pressable
                    onPress={() => {
                      Keyboard.dismiss();
                      setDatePickerFor(idx);
                    }}
                    style={[
                      styles.fakeInput,
                      {
                        borderColor: borderClr,
                        backgroundColor: dark ? '#0d0d0d' : '#ffffff',
                      },
                    ]}>
                    <CalendarIcon size={16} color="#9ca3af" />
                    <Text
                      style={[
                        styles.fakeInputText,
                        {
                          color: p.bornOn
                            ? dark
                              ? '#fff'
                              : '#0F1115'
                            : '#9ca3af',
                          fontWeight: p.bornOn ? '600' : '400',
                        },
                      ]}>
                      {p.bornOn
                        ? format(new Date(p.bornOn + 'T00:00:00'), 'MMM d, yyyy')
                        : 'Select date'}
                    </Text>
                    <ChevronDown size={16} color="#9ca3af" />
                  </Pressable>
                </FieldGroup>

                <FieldGroup label="Email">
                  <Input
                    value={p.email}
                    onChangeText={(v) => updatePassenger(idx, { email: v })}
                    placeholder="you@example.com"
                    dark={dark}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                  />
                </FieldGroup>

                <FieldGroup
                  label="Phone"
                  hint="We&rsquo;ll only use this for booking updates.">
                  <Input
                    value={p.phoneE164}
                    onChangeText={(v) =>
                      updatePassenger(idx, { phoneE164: sanitisePhone(v) })
                    }
                    placeholder="+44 7123 456789"
                    dark={dark}
                    autoCorrect={false}
                    keyboardType="phone-pad"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </FieldGroup>
              </Animated.View>
            ))}
          </Pressable>
        </ScrollView>

        <View
          style={[
            styles.cta,
            {
              paddingBottom: insets.bottom + 14,
              backgroundColor: dark ? '#0d0d0d' : '#F8F9FA',
              borderTopColor: dark ? '#27272a' : '#E5E7EB',
            },
          ]}>
          <ContinueButton
            enabled={isValid && !submitting}
            submitting={submitting}
            onPress={onPay}
          />
        </View>
      </KeyboardAvoidingView>

      {datePickerFor !== null ? (
        <DobPickerModal
          dark={dark}
          initialIso={passengers[datePickerFor]?.bornOn || ''}
          onCancel={() => setDatePickerFor(null)}
          onConfirm={(iso) => {
            const idx = datePickerFor;
            setDatePickerFor(null);
            if (idx === null) return;
            updatePassenger(idx, { bornOn: iso });
          }}
        />
      ) : null}
    </AppSafeAreaView>
  );
}

function FieldGroup({
  label,
  hint,
  children,
  style,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

function Input(
  props: React.ComponentProps<typeof TextInput> & { dark: boolean },
) {
  const { dark, style, ...rest } = props;
  const focus = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    borderColor:
      focus.value > 0
        ? PINK
        : dark
          ? '#27272a'
          : '#EEF0F3',
  }));
  return (
    <Animated.View style={[styles.inputWrap, animatedStyle]}>
      <TextInput
        {...rest}
        placeholderTextColor="#9ca3af"
        selectionColor={PINK}
        onFocus={(e) => {
          focus.value = withTiming(1, { duration: 160 });
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          focus.value = withTiming(0, { duration: 160 });
          rest.onBlur?.(e);
        }}
        style={[
          styles.input,
          {
            color: dark ? '#fff' : '#0F1115',
            backgroundColor: dark ? '#0d0d0d' : '#ffffff',
          },
          style,
        ]}
      />
    </Animated.View>
  );
}

function SelectablePill({
  active,
  onPress,
  label,
  dark,
  flex,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
  dark: boolean;
  flex?: boolean;
}) {
  const scale = useSharedValue(1);
  const bg = useSharedValue(active ? 1 : 0);

  React.useEffect(() => {
    bg.value = withTiming(active ? 1 : 0, { duration: 180 });
  }, [active, bg]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[flex ? { flex: 1 } : undefined, animated]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.94, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        style={[
          styles.pill,
          flex ? { flex: 1, alignItems: 'center', paddingVertical: 12 } : null,
          {
            backgroundColor: active
              ? PINK
              : dark
                ? '#0d0d0d'
                : '#F1F3F5',
          },
        ]}>
        <Text
          style={{
            color: active ? '#fff' : dark ? '#9ca3af' : '#6B7280',
            fontWeight: active ? '700' : '500',
            fontSize: 13.5,
          }}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function ContinueButton({
  enabled,
  submitting,
  onPress,
}: {
  enabled: boolean;
  submitting: boolean;
  onPress: () => void;
}) {
  const opacity = useSharedValue(enabled ? 1 : 0.5);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withTiming(enabled ? 1 : 0.5, { duration: 200 });
  }, [enabled, opacity]);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animated}>
      <Pressable
        onPress={onPress}
        disabled={!enabled}
        onPressIn={() => {
          if (!enabled) return;
          scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        style={styles.payBtn}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payBtnText}>Continue to payment</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

function DobPickerModal({
  dark,
  initialIso,
  onCancel,
  onConfirm,
}: {
  dark: boolean;
  initialIso: string;
  onCancel: () => void;
  onConfirm: (iso: string) => void;
}) {
  const today = new Date();
  const maxDob = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );
  const minDob = new Date(1920, 0, 1);
  const initial = initialIso
    ? new Date(initialIso + 'T00:00:00')
    : new Date(2000, 0, 1);
  const [date, setDate] = useState<Date>(initial);

  const toIso = (d: Date) => format(d, 'yyyy-MM-dd');

  if (Platform.OS === 'android') {
    // Android: open native dialog directly via the unmounted-effect pattern.
    return (
      <DateTimePicker
        value={initial}
        mode="date"
        display="default"
        maximumDate={maxDob}
        minimumDate={minDob}
        onChange={(event, selected) => {
          if (event.type === 'dismissed' || !selected) {
            onCancel();
            return;
          }
          onConfirm(toIso(selected));
        }}
      />
    );
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.modalBackdrop} onPress={onCancel}>
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[
            styles.modalSheet,
            { backgroundColor: dark ? '#1c1c1e' : '#ffffff' },
          ]}
          onStartShouldSetResponder={() => true}>
          <View style={styles.modalHead}>
            <Pressable hitSlop={12} onPress={onCancel}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: dark ? '#fff' : '#000' }]}>
              Date of birth
            </Text>
            <Pressable hitSlop={12} onPress={() => onConfirm(toIso(date))}>
              <Text style={styles.modalDone}>Done</Text>
            </Pressable>
          </View>
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            maximumDate={maxDob}
            minimumDate={minDob}
            themeVariant={dark ? 'dark' : 'light'}
            onChange={(_e, selected) => {
              if (selected) setDate(selected);
            }}
            style={{ backgroundColor: dark ? '#1c1c1e' : '#ffffff' }}
          />
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#33333322',
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F3F5',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: { fontSize: 12.5, color: '#9ca3af', marginTop: 2 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  passengerBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerBadgeText: { color: PINK, fontWeight: '800', fontSize: 13 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  fieldLabel: {
    fontSize: 11.5,
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  fieldHint: {
    fontSize: 11.5,
    color: '#9ca3af',
    marginTop: 2,
  },
  row: { flexDirection: 'row', gap: 10 },
  titleRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  inputWrap: {
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
  },
  fakeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  fakeInputText: { flex: 1, fontSize: 15 },
  cta: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  payBtn: {
    backgroundColor: PINK,
    paddingVertical: 17,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: PINK,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  modalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  modalCancel: { fontSize: 15, color: '#9ca3af' },
  modalTitle: { fontSize: 15, fontWeight: '700' },
  modalDone: { fontSize: 15, color: PINK, fontWeight: '700' },
});
