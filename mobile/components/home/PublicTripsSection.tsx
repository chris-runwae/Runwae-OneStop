import { TripCardSkeleton } from '@/components/ui/CardSkeletons';
import SectionHeader from '@/components/ui/SectionHeader';
import { TripWithEverything } from '@/hooks/useTripActions';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import TripCard from './TripCard';

interface PublicTripsSectionProps {
  data: TripWithEverything[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

const PublicTripsSection = ({
  data,
  title = 'Public Trips',
  subtitle = 'Check out what others are planning',
  loading = false,
}: PublicTripsSectionProps) => {
  const displayData = loading ? Array(3).fill({}) : data;
  const router = useRouter();

  return (
    <View className="mt-5">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        showSubtitle={!!subtitle}
        // onPress={() => router.navigate('/(tabs)/(trips)')} // Maybe a specialized discover page later
      />

      <FlatList
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
          loading ? (
            <View style={{ width: 340 }}>
              <TripCardSkeleton />
            </View>
          ) : (
            <TripCard trip={item} />
          )
        }
        ListEmptyComponent={
          !loading ? (
            <View className="flex w-full items-center justify-center py-8">
              <Text className="mb-3 text-3xl">🏜️</Text>
              <Text
                className="text-base font-semibold dark:text-white"
                style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
                No public trips yet
              </Text>
              <Text className="mt-1 text-center text-xs text-gray-400">
                Be the first to share your journey!
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default PublicTripsSection;
