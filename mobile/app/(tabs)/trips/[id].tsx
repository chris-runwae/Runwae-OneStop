import { ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, RelativePathString, useLocalSearchParams } from 'expo-router';
import { ImageBackground } from 'expo-image';

import {
  DateRange,
  HomeScreenSkeleton,
  ScreenContainer,
  Spacer,
  Text,
} from '@/components';
import { AvatarGroup } from '@/components/ui/AvatarGroup';
import { HorizontalTabs } from '@/components/ui/HorizontalTabs';
import useTrips from '@/hooks/useTrips';
import { Trip, TripAttendee } from '@/types/trips.types';
import { Menu } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/utils/styles';
import { TripItinerary } from '@/components/containers/TripItinerary';

const TripsDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const {
    fetchTripById,
    loading: tripLoading,
    fetchTripAttendees,
  } = useTrips();
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [attendees, setAttendees] = useState<TripAttendee[]>([]);
  const [activeTab, setActiveTab] = useState<string>('discover');

  const fetchTrip = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchTripById(id as string);
      if (result && !Array.isArray(result)) {
        setTrip(result as Trip);
      } else if (Array.isArray(result)) {
        setTrip(result[0] as Trip);
      }
    } catch (error) {
      console.log('Error fetching trip: ', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  useEffect(() => {
    fetchAttendees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip]);

  const fetchAttendees = useCallback(async () => {
    try {
      setLoading(true);
      if (!trip?.id) return;
      const result = await fetchTripAttendees(trip?.id);
      if (result) {
        setAttendees(result as TripAttendee[]);
      }
    } catch (error) {
      console.log('Error fetching attendees: ', error);
    } finally {
      setLoading(false);
    }
  }, [trip?.id, fetchTripAttendees]);

  const dynamicStyles = StyleSheet.create({
    infoContainer: {
      borderColor: colors.borderColors.default,
      maxWidth: 200,
    },
    emptyText: {
      color: colors.textColors.subtle,
    },
  });

  const dummyAttendees: TripAttendee[] = [
    {
      id: '1',
      trip_id: '09e7a393-3919-46cb-b16e-5ee45410abc1',
      user_id: 'user_33wEUdT7FLSOj95DSJfpZYM2cKi',
      role: 'owner',
      name: 'Christopher',
      profile_photo_url: 'https://i.pravatar.cc/150?img=1',
      inserted_at: '2025-11-22T20:00:00Z',
      updated_at: '2025-11-22T20:00:00Z',
    },
    {
      id: '2',
      trip_id: '09e7a393-3919-46cb-b16e-5ee45410abc1',
      user_id: 'user_2',
      role: 'admin',
      name: 'Alice',
      profile_photo_url: null,
      inserted_at: '2025-11-22T20:01:00Z',
      updated_at: '2025-11-22T20:01:00Z',
    },
    {
      id: '3',
      trip_id: '09e7a393-3919-46cb-b16e-5ee45410abc1',
      user_id: 'user_3',
      role: 'member',
      name: 'Bob',
      profile_photo_url: null,
      inserted_at: '2025-11-22T20:02:00Z',
      updated_at: '2025-11-22T20:02:00Z',
    },
    {
      id: '4',
      trip_id: '09e7a393-3919-46cb-b16e-5ee45410abc1',
      user_id: 'user_4',
      role: 'member',
      name: 'Diana',
      profile_photo_url: 'https://i.pravatar.cc/150?img=4',
      inserted_at: '2025-11-22T20:03:00Z',
      updated_at: '2025-11-22T20:03:00Z',
    },
    {
      id: '5',
      trip_id: '09e7a393-3919-46cb-b16e-5ee45410abc1',
      user_id: 'user_5',
      role: 'member',
      name: 'Eve',
      profile_photo_url: 'https://i.pravatar.cc/150?img=5',
      inserted_at: '2025-11-22T20:04:00Z',
      updated_at: '2025-11-22T20:04:00Z',
    },
    {
      id: '6',
      trip_id: '09e7a393-3919-46cb-b16e-5ee45410abc1',
      user_id: 'user_6',
      role: 'member',
      name: 'Frank',
      profile_photo_url: 'https://i.pravatar.cc/150?img=6',
      inserted_at: '2025-11-22T20:05:00Z',
      updated_at: '2025-11-22T20:05:00Z',
    },
  ];

  if (loading || tripLoading) {
    return <HomeScreenSkeleton />;
  }

  const RenderMenuEllipsis = () => {
    return (
      <Link href={'/(tabs)/index' as RelativePathString}>
        <Link.Trigger>
          <Menu size={20} color={colors.headerIcon} />
        </Link.Trigger>
        <Link.Menu>
          <Link.MenuAction title="Edit" onPress={() => {}} />
          <Link.MenuAction title="Delete" onPress={() => {}} />
        </Link.Menu>
      </Link>
    );
  };

  return (
    <ScreenContainer
      contentContainerStyle={styles.contentContainer}
      leftComponent
      header={{ rightComponent: <RenderMenuEllipsis /> }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={{ uri: trip?.cover_image_url ?? '' }}
          style={styles.imageBackground}
        />
        <Spacer size={16} vertical />
        <Text style={styles.title}>{trip?.title}</Text>
        <Spacer size={8} vertical />
        <View style={styles.locationTimeSpan}>
          <View style={[styles.infoContainer, dynamicStyles.infoContainer]}>
            <Text style={styles.infoText} numberOfLines={1}>
              📍 {trip?.destination}
            </Text>
          </View>
          <View style={[styles.infoContainer, dynamicStyles.infoContainer]}>
            <DateRange
              startDate={trip?.start_date ?? ''}
              endDate={trip?.end_date ?? ''}
              emoji={true}
              color={colors.textColors.default}
            />
          </View>
        </View>

        <Spacer size={14} vertical />
        <Text style={styles.description}>{trip?.description}</Text>
        <Spacer size={14} vertical />
        <AvatarGroup
          attendees={dummyAttendees}
          maxVisible={4}
          size={30}
          overlap={12}
        />
        <Spacer size={32} vertical />

        <HorizontalTabs
          tabs={[
            { id: 'discover', label: 'Discover' },
            { id: 'saved', label: 'Saved' },
            { id: 'itinerary', label: 'Itinerary' },
            { id: 'activity', label: 'Activity' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <Spacer size={24} vertical />

        {activeTab === 'itinerary' && (
          <>
            <TripItinerary tripId={trip?.id as string} />
            <Spacer size={14} vertical />
          </>
        )}
        {activeTab === 'discover' && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
              Discover content coming soon
            </Text>
          </View>
        )}
        {activeTab === 'saved' && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
              Saved content coming soon
            </Text>
          </View>
        )}
        {activeTab === 'activity' && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
              Activity content coming soon
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

export default TripsDetailsScreen;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 12,
    marginTop: 12,
  },
  imageBackground: {
    width: '100%',
    height: 250,
  },
  locationTimeSpan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoContainer: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 99,
  },
  infoText: {
    ...textStyles.subtitle_Regular,
    fontSize: 13,
    lineHeight: 19.5,
  },

  //Text styles
  title: {
    ...textStyles.bold_20,
    fontSize: 18,
    lineHeight: 24,
  },
  description: {
    ...textStyles.subtitle_Regular,
    fontSize: 14,
    lineHeight: 19.5,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...textStyles.subtitle_Regular,
    fontSize: 14,
    lineHeight: 19.5,
  },
});
