import { StyleSheet, useColorScheme } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { HomeScreenSkeleton, ScreenContainer, Text } from '@/components';
import { Link, RelativePathString, useLocalSearchParams } from 'expo-router';
import useTrips from '@/hooks/useTrips';
import { Trip } from '@/types/trips.types';
import { Menu } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

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

  if (loading || tripLoading) {
    return <HomeScreenSkeleton />;
  }

  const RenderMenuEllipsis = () => {
    return (
      <Link href={'/(tabs)/index' as RelativePathString}>
        <Link.Trigger>
          {/* <Menu size={20} color={colors.headerIcon} /> */}
          Menu
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
      leftComponent
      header={{ rightComponent: <RenderMenuEllipsis /> }}>
      <Text>{id}</Text>
      <Link href={'/trips' as RelativePathString}>
        <Link.Trigger>
          <Menu size={20} color={colors.headerIcon} />
        </Link.Trigger>
        <Link.Menu>
          <Link.MenuAction title="Edit" onPress={() => {}} />
          <Link.MenuAction title="Delete" onPress={() => {}} />
        </Link.Menu>
      </Link>
    </ScreenContainer>
  );
};

export default TripsDetailsScreen;

const styles = StyleSheet.create({});
