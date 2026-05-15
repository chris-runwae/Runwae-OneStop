import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Car,
  Plane,
  Ticket,
  Ship,
} from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components';
import { Colors, textStyles, AppFonts } from '@/constants';
import { api } from '@runwae/convex/convex/_generated/api';

type BookingRow = {
  _id: string;
  type: 'flight' | 'hotel' | 'tour' | 'car_rental' | 'event_ticket';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  grossAmount: number;
  currency: string;
  bookedAt: number;
  rawResponse?: {
    hotelName?: string;
    checkin?: string;
    checkout?: string;
    summary?: string; // flight: "LHR→JFK · JFK→LHR"
    carrier?: string;
    duffelBookingReference?: string;
    liteapiConfirmationCode?: string;
  };
};

const TYPE_META: Record<
  BookingRow['type'],
  { label: string; Icon: React.ComponentType<{ size: number; color: string }> }
> = {
  hotel: { label: 'Stay', Icon: Building2 },
  flight: { label: 'Flight', Icon: Plane },
  tour: { label: 'Tour', Icon: Ship },
  car_rental: { label: 'Car', Icon: Car },
  event_ticket: { label: 'Event', Icon: Ticket },
};

const STATUS_TINT: Record<
  BookingRow['status'],
  { fg: string; bg: string; label: string }
> = {
  pending: { fg: '#B45309', bg: '#FEF3C7', label: 'Pending' },
  confirmed: { fg: '#15803D', bg: '#DCFCE7', label: 'Confirmed' },
  cancelled: { fg: '#B91C1C', bg: '#FEE2E2', label: 'Cancelled' },
  completed: { fg: '#1E40AF', bg: '#DBEAFE', label: 'Completed' },
};

function formatBookedAt(ms: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(ms));
}

function titleFor(b: BookingRow): string {
  if (b.type === 'hotel') return b.rawResponse?.hotelName ?? 'Hotel booking';
  if (b.type === 'flight') {
    const summary = b.rawResponse?.summary;
    const carrier = b.rawResponse?.carrier;
    if (summary && carrier) return `${carrier} · ${summary}`;
    if (summary) return summary;
    return 'Flight';
  }
  if (b.type === 'event_ticket') return 'Event tickets';
  return TYPE_META[b.type].label;
}

function subtitleFor(b: BookingRow): string {
  if (b.type === 'hotel' && b.rawResponse?.checkin && b.rawResponse?.checkout) {
    return `${b.rawResponse.checkin} → ${b.rawResponse.checkout}`;
  }
  return `Booked ${formatBookedAt(b.bookedAt)}`;
}

export default function MyBookingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bookings = useQuery(api.bookings.getMyBookings, {});
  const loading = bookings === undefined;

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.backgroundColors.default }}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.textColors.default} />
        </Pressable>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#FF1F8C" />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.center}>
          <Calendar size={48} color="#D1D5DB" />
          <Text
            style={[styles.emptyTitle, { color: colors.textColors.default }]}>
            No bookings yet
          </Text>
          <Text
            style={[styles.emptySub, { color: colors.textColors.subtle }]}>
            Hotels, flights, and event tickets you book will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings as unknown as BookingRow[]}
          keyExtractor={(b) => b._id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 32,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.Icon;
            const tint = STATUS_TINT[item.status];
            const amountLabel = new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: item.currency || 'GBP',
              maximumFractionDigits: 0,
            }).format(item.grossAmount);
            return (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/profile/bookings/[bookingId]',
                    params: { bookingId: item._id },
                  })
                }
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.borderColors.subtle,
                  },
                ]}>
                <View style={styles.iconWrap}>
                  <Icon size={20} color="#FF1F8C" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTop}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.title,
                        { color: colors.textColors.default },
                      ]}>
                      {titleFor(item)}
                    </Text>
                    <View
                      style={[styles.statusPill, { backgroundColor: tint.bg }]}>
                      <Text
                        style={[styles.statusPillText, { color: tint.fg }]}>
                        {tint.label}
                      </Text>
                    </View>
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.subtitle,
                      { color: colors.textColors.subtle },
                    ]}>
                    {subtitleFor(item)}
                  </Text>
                  <View style={styles.rowBottom}>
                    <Text
                      style={[styles.typeTag, { color: colors.textColors.subtle }]}>
                      {meta.label}
                    </Text>
                    <Text
                      style={[styles.amount, { color: colors.textColors.default }]}>
                      {amountLabel}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
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
  emptyTitle: {
    ...textStyles.textHeading16,
    marginTop: 12,
  },
  emptySub: { ...textStyles.textBody14, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF1F8C18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    ...textStyles.textHeading16,
    fontSize: 15,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: AppFonts.inter.medium,
  },
  subtitle: {
    ...textStyles.textBody12,
    marginTop: 4,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  typeTag: {
    fontSize: 11,
    fontFamily: AppFonts.inter.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  amount: {
    ...textStyles.textHeading16,
    fontSize: 14,
  },
});
