import EmptyTripsState from '@/components/trips/EmptyTripsState';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { TripCardSkeleton } from '@/components/ui/CardSkeletons';
import NotificationBell from '@/components/ui/NotificationBell';
import { useTrips } from '@/context/TripsContext';
import { TripWithEverything } from '@/hooks/useTripActions';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TripCard from '@/components/home/TripCard';
import { FlashList } from '@shopify/flash-list';

// ================================================================
// Types & constants
// ================================================================

type Segment = 'active' | 'saved' | 'past';

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'saved', label: 'Saved' },
  { key: 'past', label: 'Past' },
];

const ROLE_FILTERS = [
  { id: 'all', name: 'All', emoji: '' },
  { id: 'Leader', name: 'Leader', emoji: '👤' },
  { id: 'Member', name: 'Member', emoji: '🥳' },
];

const PRIMARY = '#FF2E92';
const DARK_SEC = '#212529';

// ================================================================
// Helpers
// ================================================================

function isActive(trip: TripWithEverything): boolean {
  const endDate = trip.trip_details?.end_date;
  if (!endDate) return true;
  return new Date(endDate) >= new Date(new Date().toDateString());
}

function isPast(trip: TripWithEverything): boolean {
  const endDate = trip.trip_details?.end_date;
  if (!endDate) return false;
  return new Date(endDate) < new Date(new Date().toDateString());
}

function isSaved(trip: TripWithEverything): boolean {
  return (trip.trip_details as any)?.is_saved === true;
}

// ================================================================
// TripCard
// ================================================================

// interface TripCardProps {
//   trip: TripWithDetails;
//   dark: boolean;
// }

// function TripCard({ trip, dark }: TripCardProps) {
//   const coverImage = trip.trip_details?.cover_image_url;
//   const dateRange = formatDateRange(
//     trip.trip_details?.start_date,
//     trip.trip_details?.end_date
//   );

//   // console.log('trip', trip);

//   return (
//     <TouchableOpacity
//       style={[styles.card, { backgroundColor: dark ? '#1c1c1e' : '#ffffff' }]}
//       onPress={() => router.push(`/(tabs)/(trips)/${trip.id}` as any)}
//       activeOpacity={0.85}>
//       <View style={styles.cardImageContainer}>
//         {coverImage ? (
//           <Image
//             source={{ uri: coverImage }}
//             style={styles.cardImage}
//             resizeMode="cover"
//           />
//         ) : (
//           <View
//             style={[
//               styles.cardImagePlaceholder,
//               { backgroundColor: dark ? '#2c2c2e' : '#f3f4f6' },
//             ]}>
//             <MapPin
//               size={28}
//               strokeWidth={1.5}
//               color={dark ? '#6b7280' : '#9ca3af'}
//             />
//           </View>
//         )}
//       </View>

//       <View style={styles.cardBody}>
//         <Text
//           style={[styles.cardTitle, { color: dark ? '#ffffff' : '#111827' }]}
//           numberOfLines={1}>
//           {trip.name}
//         </Text>

//         {trip.destination_label ? (
//           <View style={styles.cardRow}>
//             <MapPin
//               size={13}
//               strokeWidth={1.5}
//               color={dark ? '#9ca3af' : '#6b7280'}
//             />
//             <Text
//               style={[styles.cardMeta, { color: dark ? '#9ca3af' : '#6b7280' }]}
//               numberOfLines={1}>
//               {trip.destination_label}
//             </Text>
//           </View>
//         ) : null}

//         <View style={styles.cardFooter}>
//           <Text
//             style={[styles.cardDate, { color: dark ? '#6b7280' : '#9ca3af' }]}>
//             {dateRange}
//           </Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// }

// ================================================================
// TripsIndexScreen
// ================================================================

export default function TripsIndexScreen() {
  const router = useRouter();
  const {
    myTrips,
    joinedTrips,
    isLoading,
    refreshMyTrips,
    refreshJoinedTrips,
  } = useTrips();
  const { dark } = useTheme();
  const [activeSegment, setActiveSegment] = useState<Segment>('active');
  const [activeRoleFilter, setActiveRoleFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const myTripIds = useMemo(() => new Set(myTrips.map((t) => t.id)), [myTrips]);

  const allTrips = useMemo(
    () => [...myTrips, ...joinedTrips],
    [myTrips, joinedTrips]
  );

  const segmentedTrips = useMemo(() => {
    switch (activeSegment) {
      case 'active':
        return allTrips.filter((t) => isActive(t as TripWithEverything));
      case 'past':
        return allTrips.filter((t) => isPast(t as TripWithEverything));
      case 'saved':
        return allTrips.filter((t) => isSaved(t as TripWithEverything));
    }
  }, [allTrips, activeSegment]);

  const filteredTrips = useMemo(() => {
    if (activeRoleFilter === 'all') return segmentedTrips;
    if (activeRoleFilter === 'Leader')
      return segmentedTrips.filter((t) => myTripIds.has(t.id));
    if (activeRoleFilter === 'Member')
      return segmentedTrips.filter((t) => !myTripIds.has(t.id));
    return segmentedTrips;
  }, [segmentedTrips, activeRoleFilter, myTripIds]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshMyTrips(), refreshJoinedTrips()]);
    setRefreshing(false);
  };

  const activeFilter = ROLE_FILTERS.find((f) => f.id === activeRoleFilter);

  const emptyTitle =
    activeSegment === 'active' && activeRoleFilter !== 'all'
      ? `No ${activeFilter?.name} Trips Yet`
      : activeSegment === 'active'
        ? 'No Trips Booked Yet'
        : `No ${activeSegment.charAt(0).toUpperCase() + activeSegment.slice(1)} Trips Yet`;

  const emptyDescription =
    activeSegment === 'active' && activeRoleFilter !== 'all'
      ? `You don't have any trips as a ${activeFilter?.name}.`
      : activeSegment === 'active'
        ? 'Tap the + below to start planning your\nnext adventure!'
        : activeSegment === 'saved'
          ? 'Trips you save will appear here for easy planning.'
          : 'Completed trips will show up here as your history.';

  const ListHeaderComponent = () => {
    if (activeSegment !== 'active') return null;

    return (
      <View style={styles.filterRow}>
        <FlashList
          data={ROLE_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterListContent}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          renderItem={({ item: filter }) => {
            const isSelected = activeRoleFilter === filter.id;
            return (
              <TouchableOpacity
                onPress={() => setActiveRoleFilter(filter.id)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected
                      ? PRIMARY
                      : dark
                        ? DARK_SEC
                        : '#ffffff',
                    borderColor: isSelected
                      ? PRIMARY
                      : dark
                        ? 'rgba(255,255,255,0.1)'
                        : '#e5e7eb',
                  },
                ]}>
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isSelected
                        ? '#ffffff'
                        : dark
                          ? '#ffffff'
                          : '#4b5563',
                    },
                  ]}>
                  {filter.emoji ? `${filter.emoji} ` : ''}
                  {filter.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  return (
    <AppSafeAreaView edges={['top']}>
      {/* Header + tabs */}
      <View
        style={[
          styles.headerSection,
          { borderBottomColor: dark ? DARK_SEC : '#f3f4f6' },
        ]}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.headerTitle,
              { color: dark ? '#ffffff' : '#111827' },
            ]}>
            Trips
          </Text>
          <NotificationBell />
        </View>

        <View style={styles.tabRow}>
          {SEGMENTS.map(({ key, label }) => {
            const isSelected = activeSegment === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveSegment(key)}
                style={[
                  styles.tabPill,
                  {
                    backgroundColor: isSelected
                      ? PRIMARY
                      : dark
                        ? DARK_SEC
                        : '#f3f4f6',
                  },
                ]}>
                <Text
                  style={[
                    styles.tabPillText,
                    {
                      color: isSelected
                        ? '#ffffff'
                        : dark
                          ? '#ffffff'
                          : '#9ca3af',
                    },
                  ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
      {isLoading && !refreshing ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((i) => (
            <TripCardSkeleton key={i} fullWidth />
          ))}
        </View>
      ) : (
        <FlashList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            filteredTrips.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <TripCard trip={item as TripWithEverything} fullWidth={true} />
          )}
          ItemSeparatorComponent={() => <View className="h-4" />}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={
            <EmptyTripsState
              title={emptyTitle}
              description={emptyDescription}
            />
          }
        />
      )}
    </AppSafeAreaView>
  );
}

// ================================================================
// Styles
// ================================================================

const styles = StyleSheet.create({
  // Header
  headerSection: {
    paddingTop: 20,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'BricolageGrotesque-ExtraBold',
  },

  // Tab pills
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 16,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabPillText: {
    fontSize: 14,
  },

  // Role filters
  filterRow: {
    paddingTop: 16,
  },
  filterListContent: {},
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 14,
  },

  // Loading skeletons
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 12,
  },
  listContentEmpty: {
    // flex: 1,
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
});
