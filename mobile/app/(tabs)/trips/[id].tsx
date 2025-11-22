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
import useTrips from '@/hooks/useTrips';
import { Trip } from '@/types/trips.types';
import { Menu } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/utils/styles';

const TripsDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { fetchTripById, loading: tripLoading } = useTrips();
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);

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
    console.log('Trip: ', trip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTrip]);

  const dynamicStyles = StyleSheet.create({
    infoContainer: {
      borderColor: colors.borderColors.default,
    },
  });

  if (loading || tripLoading) {
    return <HomeScreenSkeleton />;
  }

  console.log('Trip: ', trip);

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
            <Text style={styles.infoText}>📍 {trip?.destination}</Text>
          </View>
          <View style={[styles.infoContainer, dynamicStyles.infoContainer]}>
            <DateRange
              startDate={trip?.start_date ?? ''}
              endDate={trip?.end_date ?? ''}
              emoji={true}
            />
          </View>
        </View>

        <Spacer size={14} vertical />
        <Text style={styles.description}>{trip?.description}</Text>
        <Spacer size={14} vertical />
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
});
