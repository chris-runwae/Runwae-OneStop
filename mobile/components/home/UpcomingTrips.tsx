import { TripCardSkeleton } from '@/components/ui/CardSkeletons';
import SectionHeader from '@/components/ui/SectionHeader';
// import { Trip } from '@/constants/home.constant';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { TripWithEverything } from '@/hooks/useTripActions';

import TripCard from './TripCard';

interface UpcomingTripsProps {
  trips: TripWithEverything[];
  loading?: boolean;
}

const UpcomingTrips = ({ trips, loading = false }: UpcomingTripsProps) => {
  const router = useRouter();
  const displayData = loading ? Array(5).fill({}) : trips;

  return (
    <View>
      <SectionHeader
        title={`Active Trips (${trips.length})`}
        onPress={() => router.push('/trips')}
      />

      <FlashList
        data={displayData}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          marginTop: 10,
          paddingHorizontal: 20,
        }}
        keyExtractor={(item, index) =>
          loading ? `skeleton-${index}` : item.id
        }
        ItemSeparatorComponent={() => <View className="w-3" />}
        renderItem={({ item }) =>
          loading ? <TripCardSkeleton /> : <TripCard trip={item} />
        }
        ListEmptyComponent={
          <View className="flex w-full items-center justify-center">
            <Image
              source={require('@/assets/images/trip-empty-state.png')}
              className="mb-5 h-[44px] w-[44px]"
              resizeMode="contain"
            />
            <Text
              className="text-lg font-semibold dark:text-white"
              style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
              No trips planned yet
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-400 dark:text-gray-500">
              No upcoming trips. Let&apos;s start exploring and plan{'\n'} your
              first adventure!
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default UpcomingTrips;
