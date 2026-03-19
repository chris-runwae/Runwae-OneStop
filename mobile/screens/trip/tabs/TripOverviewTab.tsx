import { useAuth } from '@/context/AuthContext';
import { GroupMember, TripWithEverything } from '@/hooks/useTripActions';
import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Calendar, DollarSign, Edit2, MapPin } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ================================================================
// Helpers
// ================================================================

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£', USD: '$', EUR: '€', JPY: '¥',
  AUD: 'A$', CAD: 'C$', CHF: 'Fr', CNY: '¥', INR: '₹',
};

function formatBudget(budget: number | null, currency: string): string {
  if (budget === null) return 'No budget set';
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${symbol}${budget.toLocaleString()}`;
}

function formatDateRange(start?: string | null, end?: string | null): string {
  if (!start && !end) return 'Dates not set';
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (start && end) return `${fmt(start)} → ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  return `Until ${fmt(end!)}`;
}

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#DDA0DD', '#F4A261', '#2A9D8F', '#E76F51',
];

function avatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(member: GroupMember): string {
  const name = member.profiles?.full_name;
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
}

// ================================================================
// TripOverviewTab
// ================================================================

interface Props {
  trip: TripWithEverything;
}

const MAX_VISIBLE_AVATARS = 5;

export default function TripOverviewTab({ trip }: Props) {
  const { dark } = useTheme();
  const { user } = useAuth();
  const details = trip.trip_details;
  const members = trip.group_members;

  const myRole = members.find((m) => m.user_id === user?.id)?.role;
  const canEdit = myRole === 'owner' || myRole === 'admin';

  const visibleMembers = members.slice(0, MAX_VISIBLE_AVATARS);
  const extraCount = members.length - MAX_VISIBLE_AVATARS;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Destination */}
      <View style={[styles.card, { backgroundColor: dark ? '#1c1c1e' : '#f9fafb' }]}>
        <View style={styles.cardRow}>
          <MapPin size={18} strokeWidth={1.5} color="#FF1F8C" />
          <Text style={[styles.cardLabel, { color: dark ? '#9ca3af' : '#6b7280' }]}>
            Destination
          </Text>
        </View>
        <Text style={[styles.cardValue, { color: dark ? '#ffffff' : '#111827' }]}>
          {trip.destination_label ?? 'No destination set'}
        </Text>
      </View>

      {/* Dates */}
      <View style={[styles.card, { backgroundColor: dark ? '#1c1c1e' : '#f9fafb' }]}>
        <View style={styles.cardRow}>
          <Calendar size={18} strokeWidth={1.5} color="#FF1F8C" />
          <Text style={[styles.cardLabel, { color: dark ? '#9ca3af' : '#6b7280' }]}>
            Dates
          </Text>
        </View>
        <Text style={[styles.cardValue, { color: dark ? '#ffffff' : '#111827' }]}>
          {formatDateRange(details?.start_date, details?.end_date)}
        </Text>
      </View>

      {/* Budget */}
      <View style={[styles.card, { backgroundColor: dark ? '#1c1c1e' : '#f9fafb' }]}>
        <View style={styles.cardRow}>
          <DollarSign size={18} strokeWidth={1.5} color="#FF1F8C" />
          <Text style={[styles.cardLabel, { color: dark ? '#9ca3af' : '#6b7280' }]}>
            Budget
          </Text>
        </View>
        <Text style={[styles.cardValue, { color: dark ? '#ffffff' : '#111827' }]}>
          {formatBudget(details?.budget ?? null, details?.currency ?? 'GBP')}
        </Text>
      </View>

      {/* Description */}
      {trip.description ? (
        <View style={[styles.card, { backgroundColor: dark ? '#1c1c1e' : '#f9fafb' }]}>
          <Text style={[styles.cardLabel, { color: dark ? '#9ca3af' : '#6b7280', marginBottom: 6 }]}>
            About this trip
          </Text>
          <Text style={[styles.description, { color: dark ? '#d1d5db' : '#374151' }]}>
            {trip.description}
          </Text>
        </View>
      ) : null}

      {/* Members */}
      <View style={[styles.card, { backgroundColor: dark ? '#1c1c1e' : '#f9fafb' }]}>
        <Text style={[styles.cardLabel, { color: dark ? '#9ca3af' : '#6b7280', marginBottom: 12 }]}>
          {members.length} {members.length === 1 ? 'Member' : 'Members'}
        </Text>
        <View style={styles.avatarRow}>
          {visibleMembers.map((m) => (
            <View
              key={m.id}
              style={[styles.avatar, { borderColor: dark ? '#1c1c1e' : '#f9fafb' }]}
            >
              {m.profiles?.avatar_url ? (
                <Image
                  source={{ uri: m.profiles.avatar_url }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.avatarInitials, { backgroundColor: avatarColor(m.user_id) }]}>
                  <Text style={styles.avatarInitialsText}>{initials(m)}</Text>
                </View>
              )}
            </View>
          ))}
          {extraCount > 0 && (
            <View style={[styles.avatar, styles.avatarExtra, { borderColor: dark ? '#1c1c1e' : '#f9fafb', backgroundColor: dark ? '#374151' : '#e5e7eb' }]}>
              <Text style={[styles.avatarExtraText, { color: dark ? '#d1d5db' : '#374151' }]}>
                +{extraCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Edit button (owner / admin only) */}
      {canEdit && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/(tabs)/(trips)/${trip.id}/edit` as any)}
        >
          <Edit2 size={16} strokeWidth={1.5} color="#FF1F8C" />
          <Text style={styles.editButtonText}>Edit trip details</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ================================================================
// Styles
// ================================================================

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 10,
  },

  card: {
    borderRadius: 12,
    padding: 14,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },

  avatarRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    marginRight: -10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  avatarExtra: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarExtraText: {
    fontSize: 12,
    fontWeight: '600',
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF1F8C',
    marginTop: 4,
  },
  editButtonText: {
    color: '#FF1F8C',
    fontSize: 15,
    fontWeight: '600',
  },
});
