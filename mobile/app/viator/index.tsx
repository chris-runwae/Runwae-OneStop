import ViatorProductCard from '@/components/viator/ViatorProductCard';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { AddOnCardSkeleton } from '@/components/ui/CardSkeletons';
import ScreenHeader from '@/components/ui/ScreenHeader';
import SearchInput from '@/components/ui/SearchInput';
import { useViator } from '@/hooks/useViator';
import type { ViatorProduct } from '@/types/viator.types';
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

const ViatorListScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { products, loading } = useViator();

  const list = products as ViatorProduct[];

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false)
    );
  }, [searchQuery, list]);

  const displayData = loading ? (Array(5).fill({}) as ViatorProduct[]) : filtered;

  return (
    <AppSafeAreaView edges={['top']}>
      <ScreenHeader hasBorder={false} title="Tours & activities" />
      <View className="mt-5 border-b-2 border-b-gray-200 px-[20px] pb-5 dark:border-b-dark-seconndary">
        <SearchInput
          placeholder="Search tours and activities..."
          showFilter={false}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {!loading && filtered.length === 0 ? (
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
            loading ? `skeleton-${index}` : item.productCode
          }
          ItemSeparatorComponent={() => <View className="h-6" />}
          renderItem={({ item }) =>
            loading ? (
              <AddOnCardSkeleton fullWidth={true} />
            ) : (
              <View className="items-center">
                <ViatorProductCard product={item} fullWidth />
              </View>
            )
          }
          ListEmptyComponent={<View />}
        />
      )}
    </AppSafeAreaView>
  );
};

export default ViatorListScreen;
