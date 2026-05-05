import { ItineraryCardSkeleton } from '@/components/ui/CardSkeletons';
import SectionHeader from '@/components/ui/SectionHeader';
import { Itinerary } from '@/constants/home.constant';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import ItineraryCard from './ItineraryCard';

interface ItineraryForYouProps {
  data: Itinerary[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  showSubtitle?: boolean;
  showBorder?: boolean;
}

const ItineraryForYou = ({
  data,
  title = 'Trip Suggestions',
  subtitle = '',
  loading = false,
  showSubtitle = false,
  showBorder = false,
}: ItineraryForYouProps) => {
  const displayData = loading ? Array(5).fill({}) : data;
  const router = useRouter();
  const isNavigating = React.useRef(false);

  const handleHeaderPress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.navigate('/itinerary');
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  return (
    <View
      className={`mt-5 ${showBorder ? 'border-b-[3px] border-b-gray-200 pb-5 dark:border-b-dark-seconndary' : ''}`}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        showSubtitle={showSubtitle}
        onPress={handleHeaderPress}
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
          loading ? <ItineraryCardSkeleton /> : <ItineraryCard item={item} />
        }
        ListEmptyComponent={
          <View className="flex w-full items-center justify-center py-8">
            <Text className="mb-3 text-3xl">🗺️</Text>
            <Text
              className="text-base font-semibold dark:text-white"
              style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
              No itineraries yet
            </Text>
            <Text className="mt-1 text-center text-xs text-gray-400">
              Check back soon for curated travel ideas!
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default ItineraryForYou;
