import AddOnCard from '@/components/home/AddOnCard';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { AddOnCardSkeleton } from '@/components/ui/CardSkeletons';
import ScreenHeader from '@/components/ui/ScreenHeader';
import SearchInput from '@/components/ui/SearchInput';
import { useExperiences } from '@/hooks/useExperiences';
import React, { useMemo, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

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

const ExperienceScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, loading } = useExperiences();

  const filteredExperiences = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [searchQuery, data]);

  const displayData = loading ? Array(5).fill({}) : filteredExperiences;

  return (
    <AppSafeAreaView edges={['top']}>
      <ScreenHeader hasBorder={false} title="Experiences" />
      <View className="mt-5 border-b-2 border-b-gray-200 px-[20px] pb-5 dark:border-b-dark-seconndary">
        <SearchInput
          placeholder="Try searching 'Eiffel Tower'"
          showFilter={false}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {!loading && filteredExperiences.length === 0 ? (
        <EmptyState />
      ) : (
        <FlashList
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
          ItemSeparatorComponent={() => <View className="h-6" />}
          renderItem={({ item }) =>
            loading ? (
              <AddOnCardSkeleton fullWidth={true} />
            ) : (
              <View className="items-center">
                <AddOnCard fullWidth item={item} />
              </View>
            )
          }
          ListEmptyComponent={<View />}
        />
      )}
    </AppSafeAreaView>
  );
};

export default ExperienceScreen;
