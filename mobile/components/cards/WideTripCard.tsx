import {
  StyleSheet,
  useColorScheme,
  View,
  ImageBackground,
  Pressable,
  Alert,
} from 'react-native';
import React from 'react';

import { DateRange, Text } from '@/components';
import { Colors } from '@/constants/theme';
import { Trip } from '@/types/trips.types';
import { toSentenceCase } from '@/utils/stringManipulation';
import {
  Link,
  LinkMenu,
  LinkMenuAction,
  RelativePathString,
  router,
} from 'expo-router';
import useTrips from '@/hooks/useTrips';

interface WideTripCardProps {
  data: Trip[] | null;
}

const WideTripCard = ({ data }: WideTripCardProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { deleteTrip, fetchTrips } = useTrips();

  if (!data) {
    return null;
  }
  const trip: Trip = Array.isArray(data) ? (data[0] as Trip) : data;
  if (!trip) {
    return null;
  }

  const coverImageUrl =
    trip?.cover_image_url ??
    'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80';

  const styles = StyleSheet.create({
    container: {
      height: 260,
      width: '100%',
      overflow: 'hidden',
      borderRadius: 12,
    },
    cardContent: {
      flex: 1,
      backgroundColor: colors.imageOverlay,
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 12,
    },
    contentContainer: {},

    cardWrapper: {
      width: '100%',
      height: 200, // MUST set a height so the card is visible
      marginBottom: 16,
      borderRadius: 12,
      overflow: 'hidden',
    },
    imageBackground: {
      flex: 1,
      justifyContent: 'flex-end',
    },

    infoContainer: {
      width: '100%',
      height: 50,
      justifyContent: 'center',
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 16,
    },
    pillContainer: {
      backgroundColor: '#000000A6',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },

    //Text Styles
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      lineHeight: 24,
      color: colors.white,
    },
    infoText: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 19.5,
      color: colors.white,
    },
    pillText: {
      fontSize: 12,
      fontWeight: 'bold',
      lineHeight: 16,
      color: colors.white,
    },
  });

  const handleDelete = () => {
    Alert.alert('Delete Trip', 'Are you sure you want to delete this trip?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const success = await deleteTrip(trip.id);
          if (success) {
            await fetchTrips();
            Alert.alert('Trip deleted successfully');
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    router.push({
      pathname: '/trips/[id]',
      params: { id: trip.id },
    });
  };

  return (
    <Link href={`/trips/${trip.id}`} asChild>
      <Link.Trigger>
        <Pressable style={styles.cardWrapper}>
          <ImageBackground
            source={{ uri: coverImageUrl }}
            style={styles.imageBackground}
            imageStyle={{ borderRadius: 12 }}>
            <View style={styles.cardContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{trip.title}</Text>
                <View style={styles.pillContainer}>
                  <Text style={styles.pillText}>
                    {toSentenceCase(trip.category ?? '')}
                  </Text>
                </View>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>📍 {trip.destination}</Text>
                <DateRange
                  startDate={trip?.start_date ?? ''}
                  endDate={trip?.end_date ?? ''}
                  emoji={true}
                />
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      </Link.Trigger>

      <Link.Menu>
        <Link.MenuAction title="Edit Trip" icon="pencil" onPress={handleEdit} />
        <Link.MenuAction
          title="Delete Trip"
          icon="trash"
          onPress={handleDelete}
          destructive
        />
      </Link.Menu>
      <Link.Preview />
    </Link>
  );
};

export default WideTripCard;
