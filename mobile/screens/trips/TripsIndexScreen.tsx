import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { useTrips } from '@/context/TripsContext';
import { TripWithDetails } from '@/hooks/useTripActions';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { MapPin, Plus, Users } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ================================================================
// Segment types
// ================================================================

type Segment = 'active' | 'saved' | 'past';

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'saved',  label: 'Saved' },
  { key: 'past',   label: 'Past'  },
];

// ================================================================
// Helpers
// ================================================================

function isActive(trip: TripWithDetails): boolean {
  const endDate = trip.trip_details?.end_date;
  if (!endDate) return true;
  return new Date(endDate) >= new Date(new Date().toDateString());
}

function isPast(trip: TripWithDetails): boolean {
  const endDate = trip.trip_details?.end_date;
  if (!endDate) return false;
  return new Date(endDate) < new Date(new Date().toDateString());
}

function isSaved(trip: TripWithDetails): boolean {
  return trip.trip_details?.is_saved === true;
}

function formatDateRange(startDate?: string | null, endDate?: string | null): string {
  if (!startDate && !endDate) return 'No dates set';
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  if (startDate && endDate) return `${fmt(startDate)} → ${fmt(endDate)}`;
  if (startDate) return `From ${fmt(startDate)}`;
  return `Until ${fmt(endDate!)}`;
}

// ================================================================
// TripCard
// ================================================================

interface TripCardProps {
  trip: TripWithDetails;
  dark: boolean;
}

function TripCard({ trip, dark }: TripCardProps) {
  const coverImage = trip.trip_details?.cover_image_url;
  const dateRange = formatDateRange(
    trip.trip_details?.start_date,
    trip.trip_details?.end_date,
  );

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: dark ? '#1c1c1e' : '#ffffff' }]}
      onPress={() => router.push(`/(tabs)/(trips)/${trip.id}` as any)}
      activeOpacity={0.85}
    >
      {/* Cover image */}
      <View style={styles.cardImageContainer}>
        {coverImage ? (
          <Image source={{ uri: coverImage }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImagePlaceholder, { backgroundColor: dark ? '#2c2c2e' : '#f3f4f6' }]}>
            <MapPin size={28} strokeWidth={1.5} color={dark ? '#6b7280' : '#9ca3af'} />
          </View>
        )}
      </View>

      {/* Card body */}
      <View style={styles.cardBody}>
        <Text
          style={[styles.cardTitle, { color: dark ? '#ffffff' : '#111827' }]}
          numberOfLines={1}
        >
          {trip.name}
        </Text>

        {trip.destination_label ? (
          <View style={styles.cardRow}>
            <MapPin size={13} strokeWidth={1.5} color={dark ? '#9ca3af' : '#6b7280'} />
            <Text
              style={[styles.cardMeta, { color: dark ? '#9ca3af' : '#6b7280' }]}
              numberOfLines={1}
            >
              {trip.destination_label}
            </Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={[styles.cardDate, { color: dark ? '#6b7280' : '#9ca3af' }]}>
            {dateRange}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ================================================================
// Empty state
// ================================================================

const EMPTY_CONTENT: Record<Segment, { title: string; body: string }> = {
  active: {
    title: 'No active trips',
    body: 'Start planning your next adventure.',
  },
  saved: {
    title: 'No saved trips',
    body: 'Save a trip to find it here later.',
  },
  past: {
    title: 'No past trips',
    body: 'Completed trips will appear here.',
  },
};

interface EmptyStateProps {
  segment: Segment;
  dark: boolean;
}

function EmptyState({ segment, dark }: EmptyStateProps) {
  const content = EMPTY_CONTENT[segment];
  return (
    <View style={styles.emptyContainer}>
      <Users size={40} strokeWidth={1} color={dark ? '#4b5563' : '#d1d5db'} />
      <Text style={[styles.emptyTitle, { color: dark ? '#ffffff' : '#111827' }]}>
        {content.title}
      </Text>
      <Text style={[styles.emptyBody, { color: dark ? '#6b7280' : '#9ca3af' }]}>
        {content.body}
      </Text>
    </View>
  );
}

// ================================================================
// TripsIndexScreen
// ================================================================

export default function TripsIndexScreen() {
  const { myTrips, joinedTrips, isLoading, refreshMyTrips, refreshJoinedTrips } = useTrips();
  const { dark } = useTheme();
  const [activeSegment, setActiveSegment] = useState<Segment>('active');
  const [refreshing, setRefreshing] = useState(false);

  const allTrips = useMemo(
    () => [...myTrips, ...joinedTrips],
    [myTrips, joinedTrips],
  );

  const filteredTrips = useMemo(() => {
    switch (activeSegment) {
      case 'active': return allTrips.filter(isActive);
      case 'past':   return allTrips.filter(isPast);
      case 'saved':  return allTrips.filter(isSaved);
    }
  }, [allTrips, activeSegment]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshMyTrips(), refreshJoinedTrips()]);
    setRefreshing(false);
  };

  return (
    <AppSafeAreaView>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: dark ? '#2c2c2e' : '#e5e7eb' }]}>
        <Text style={[styles.headerTitle, { color: dark ? '#ffffff' : '#111827' }]}>
          Trips
        </Text>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: dark ? '#2c2c2e' : '#f3f4f6' }]}
          onPress={() => router.push('/(tabs)/(trips)/create/destination' as any)}
        >
          <Plus size={18} strokeWidth={2} color={dark ? '#ffffff' : '#111827'} />
        </TouchableOpacity>
      </View>

      {/* Segmented control */}
      <View style={[styles.segmentWrapper, { backgroundColor: dark ? '#1c1c1e' : '#f3f4f6' }]}>
        {SEGMENTS.map(({ key, label }) => {
          const isSelected = activeSegment === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.segmentButton,
                isSelected && {
                  backgroundColor: dark ? '#ffffff' : '#ffffff',
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 1 },
                  elevation: 2,
                },
              ]}
              onPress={() => setActiveSegment(key)}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  {
                    color: isSelected
                      ? (dark ? '#111827' : '#111827')
                      : (dark ? '#9ca3af' : '#6b7280'),
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={dark ? '#ffffff' : '#111827'} />
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            filteredTrips.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => <TripCard trip={item} dark={dark} />}
          ListEmptyComponent={<EmptyState segment={activeSegment} dark={dark} />}
        />
      )}
    </AppSafeAreaView>
  );
}

// ================================================================
// Styles
// ================================================================

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1.5,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'BricolageGrotesque-ExtraBold',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmentWrapper: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 10,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabel: {
    fontSize: 14,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 12,
  },
  listContentEmpty: {
    flex: 1,
  },

  // Card
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardImageContainer: {
    height: 140,
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 14,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'BricolageGrotesque-SemiBold',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMeta: {
    fontSize: 13,
    flex: 1,
  },
  cardFooter: {
    marginTop: 6,
  },
  cardDate: {
    fontSize: 12,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'BricolageGrotesque-SemiBold',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
