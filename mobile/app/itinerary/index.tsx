import ItineraryCard from '@/components/home/ItineraryCard';
import { ItineraryCardSkeleton } from '@/components/ui/CardSkeletons';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import ScreenHeader from '@/components/ui/ScreenHeader';
import SearchInput from '@/components/ui/SearchInput';
import { useItineraryTemplates } from '@/hooks/useItineraryTemplates';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, Text, View } from 'react-native';

const EmptyState = () => (
  <View className="w-full flex-1 items-center justify-center bg-gray-200 dark:bg-dark-seconndary/50">
    <Image
      source={require('@/assets/images/search-empty-icon.png')}
      className="mb-8 h-[80px] w-[80px]"
      resizeMode="contain"
    />
    <Text
      className="mb-2 text-center text-lg font-semibold leading-tight dark:text-white"
      style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
      Sorry, we couldn&apos;t seem to find a match
    </Text>
    <Text className="text-center text-sm leading-relaxed text-gray-400">
      Want to try adjusting your words or use a {'\n'}different keyword.
    </Text>
  </View>
);

const Itineraries = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, loading } = useItineraryTemplates();

  const filteredItineraries = useMemo(() => {
    return data.filter(
      (itinerary) =>
        itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itinerary.activities.toString().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, data]);

  const displayData = loading ? Array(5).fill({}) : filteredItineraries;

  return (
    <AppSafeAreaView edges={['top']}>
      <ScreenHeader hasBorder={false} title="Itinerary" />
      <View className="mt-5 border-b-2 border-b-gray-200 px-[20px] pb-5 dark:border-b-dark-seconndary">
        <SearchInput
          placeholder="Try searching 'Day in Lagos'"
          showFilter={false}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {!loading && filteredItineraries.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={displayData}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
          keyExtractor={(item, index) =>
            loading ? `skeleton-${index}` : item.id
          }
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) =>
            loading ? (
              <ItineraryCardSkeleton fullWidth={true} height={371} />
            ) : (
              <ItineraryCard
                hasBorder={false}
                height={371}
                item={item}
                fullWidth={true}
              />
            )
          }
          ListEmptyComponent={<View />}
        />
      )}
    </AppSafeAreaView>
  );
};

export default Itineraries;
