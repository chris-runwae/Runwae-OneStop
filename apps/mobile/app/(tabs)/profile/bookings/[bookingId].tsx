import { useQuery } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Building2,
  Car,
  Copy,
  Plane,
  Ship,
  Ticket,
} from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components';
import { Colors, textStyles, AppFonts } from '@/constants';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';

const TYPE_META: Record<
  string,
  { label: string; Icon: React.ComponentType<{ size: number; color: string }> }
> = {
  hotel: { label: 'Stay', Icon: Building2 },
  flight: { label: 'Flight', Icon: Plane },
  tour: { label: 'Tour', Icon: Ship },
  car_rental: { label: 'Car', Icon: Car },
  event_ticket: { label: 'Event', Icon: Ticket },
};

const STATUS_TINT: Record<
  string,
  { fg: string; bg: string; label: string }
> = {
  pending: { fg: '#B45309', bg: '#FEF3C7', label: 'Pending' },
  confirmed: { fg: '#15803D', bg: '#DCFCE7', label: 'Confirmed' },
  cancelled: { fg: '#B91C1C', bg: '#FEE2E2', label: 'Cancelled' },
  completed: { fg: '#1E40AF', bg: '#DBEAFE', label: 'Completed' },
};

function formatDate(ms: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ms));
}

function copyToClipboard(value: string, label: string) {
  void Clipboard.setStringAsync(value).then(() => {
    Alert.alert(`Copied ${label}`, value);
  });
}

export default function BookingDetailScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const booking = useQuery(api.bookings.getById, {
    bookingId: bookingId as Id<'bookings'>,
  });
  const loading = booking === undefined;
  const notFound = booking === null;

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: colors.backgroundColors.default },
        ]}>
        <ActivityIndicator color="#FF1F8C" />
      </View>
    );
  }

  if (notFound) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: colors.backgroundColors.default },
        ]}>
        <Text
          style={[styles.emptyTitle, { color: colors.textColors.default }]}>
          Booking not found
        </Text>
        <Pressable onPress={() => router.back()} style={styles.backCta}>
          <Text style={styles.backCtaText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const meta = TYPE_META[booking.type] ?? TYPE_META.hotel;
  const Icon = meta.Icon;
  const tint = STATUS_TINT[booking.status] ?? STATUS_TINT.pending;
  const raw = (booking.rawResponse ?? {}) as Record<string, unknown>;

  const amountLabel = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: booking.currency || 'GBP',
    maximumFractionDigits: 0,
  }).format(booking.grossAmount);

  const titleText =
    (raw.hotelName as string | undefined) ??
    (raw.summary as string | undefined) ??
    `${meta.label} booking`;

  const confirmationCode =
    (raw.liteapiConfirmationCode as string | undefined) ??
    (raw.duffelBookingReference as string | undefined) ??
    (raw.duffelOrderId as string | undefined) ??
    null;

  type Row = { label: string; value: string; copyable?: boolean };
  const detailRows: Row[] = [];

  if (booking.type === 'hotel') {
    if (raw.hotelName)
      detailRows.push({ label: 'Hotel', value: String(raw.hotelName) });
    if (raw.checkin && raw.checkout) {
      detailRows.push({
        label: 'Stay',
        value: `${raw.checkin} → ${raw.checkout}`,
      });
    }
  } else if (booking.type === 'flight') {
    if (raw.carrier)
      detailRows.push({ label: 'Carrier', value: String(raw.carrier) });
    if (raw.summary)
      detailRows.push({ label: 'Route', value: String(raw.summary) });
  }

  detailRows.push({
    label: 'Booking type',
    value: meta.label,
  });
  detailRows.push({
    label: 'Booked',
    value: formatDate(booking.bookedAt),
  });
  if (confirmationCode) {
    detailRows.push({
      label: 'Confirmation',
      value: confirmationCode,
      copyable: true,
    });
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.backgroundColors.default }}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.textColors.default} />
        </Pressable>
        <Text style={styles.headerTitle}>Booking</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderColors.subtle,
            },
          ]}>
          <View style={styles.iconWrap}>
            <Icon size={26} color="#FF1F8C" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.textColors.default }]}>
            {titleText}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: tint.bg }]}>
            <Text style={[styles.statusPillText, { color: tint.fg }]}>
              {tint.label}
            </Text>
          </View>
          <Text style={[styles.heroAmount, { color: colors.textColors.default }]}>
            {amountLabel}
          </Text>
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderColors.subtle,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.textColors.subtle }]}>
            DETAILS
          </Text>
          {detailRows.map((row, i) => (
            <View
              key={`${row.label}-${i}`}
              style={[
                styles.detailRow,
                i < detailRows.length - 1 && {
                  borderBottomColor: colors.borderColors.subtle,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                },
              ]}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: colors.textColors.subtle },
                ]}>
                {row.label}
              </Text>
              <View style={styles.detailValueRow}>
                <Text
                  style={[
                    styles.detailValue,
                    { color: colors.textColors.default },
                  ]}>
                  {row.value}
                </Text>
                {row.copyable ? (
                  <Pressable
                    hitSlop={8}
                    onPress={() => copyToClipboard(row.value, row.label)}
                    style={styles.copyBtn}>
                    <Copy size={14} color={colors.textColors.subtle} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderColors.subtle,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.textColors.subtle }]}>
            SUPPORT
          </Text>
          <Pressable
            onPress={() => router.push('/profile/support')}
            style={styles.supportRow}>
            <Text
              style={[styles.supportText, { color: colors.textColors.default }]}>
              Contact support
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
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
  headerTitle: { ...textStyles.textHeading16, flex: 1, textAlign: 'center' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  emptyTitle: { ...textStyles.textHeading16 },
  backCta: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FF1F8C',
  },
  backCtaText: { color: '#fff', fontFamily: AppFonts.inter.medium },
  hero: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginTop: 8,
    gap: 10,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF1F8C18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    ...textStyles.textHeading16,
    fontSize: 18,
    textAlign: 'center',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: AppFonts.inter.medium,
  },
  heroAmount: {
    ...textStyles.textHeading16,
    fontSize: 22,
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: AppFonts.inter.medium,
    letterSpacing: 0.6,
    paddingTop: 8,
    paddingBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: AppFonts.inter.regular,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: AppFonts.inter.medium,
    textAlign: 'right',
    flexShrink: 1,
  },
  copyBtn: { padding: 2 },
  supportRow: {
    paddingVertical: 12,
  },
  supportText: {
    fontSize: 15,
    fontFamily: AppFonts.inter.medium,
  },
});
