import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { useDestinations } from '@/hooks/useDestinations';
import DestinationCard from '@/components/home/DestinationCard';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { DestinationCardSkeleton } from '@/components/ui/CardSkeletons';
import ScreenHeader from '@/components/ui/ScreenHeader';
import SearchInput from '@/components/ui/SearchInput';
import { useDebounce } from '@/hooks/useDebounce';

const EmptyState = () => (
  <View
    style={{
      width: '100%',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Image
      source={require('@/assets/images/search-empty-icon.png')}
      className="mb-8 h-[80px] w-[80px]"
      resizeMode="contain"
    />
    <Text
      className="mb-2 text-center text-lg font-semibold leading-tight dark:text-white"
      style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
      Sorry, we couldn&apos;t seem to find any destinations
    </Text>
    <Text className="text-center text-sm leading-relaxed text-gray-400">
      Want to try adjusting your words or use a {'\n'}different keyword.
    </Text>
  </View>
);

const DestinationsIndexScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 400);

  const { destinations, loading: destinationsLoading } = useDestinations({
    search: debouncedQuery,
  });

  return (
    <AppSafeAreaView edges={['top']}>
      <ScreenHeader hasBorder={false} title="Destinations" />
      <View className="mt-5 border-b-2 border-b-gray-200 px-[20px] pb-5 dark:border-b-dark-seconndary">
        <SearchInput
          placeholder="Try searching “Tokyo”"
          showFilter={false}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {destinationsLoading ? (
        <FlashList
          data={Array(6).fill(null)}
          numColumns={2}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 16,
            paddingTop: 20,
          }}
          keyExtractor={(_, index) => `skeleton-${index}`}
          renderItem={({ index }) => (
            <View
              style={{
                flex: 1,
                marginLeft: index % 2 !== 0 ? 6 : 0,
                marginRight: index % 2 === 0 ? 6 : 0,
              }}>
              <DestinationCardSkeleton fullWidth />
            </View>
          )}
          ItemSeparatorComponent={() => <View className="h-4" />}
        />
      ) : destinations.length === 0 ? (
        <EmptyState />
      ) : (
        <FlashList
          data={destinations}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 16,
            paddingTop: 20,
          }}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <DestinationCard
              fullWidth
              item={item}
              style={{
                marginLeft: index % 2 !== 0 ? 6 : 0,
                marginRight: index % 2 === 0 ? 6 : 0,
              }}
            />
          )}
          ListEmptyComponent={<EmptyState />}
          ItemSeparatorComponent={() => <View className="h-4" />}
        />
      )}
    </AppSafeAreaView>
  );
};

export default DestinationsIndexScreen;
