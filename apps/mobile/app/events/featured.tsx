import EventCard from '@/components/home/EventCard';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { EventCardSkeleton } from '@/components/ui/CardSkeletons';
import ScreenHeader from '@/components/ui/ScreenHeader';
import SearchInput from '@/components/ui/SearchInput';
import type { Event } from '@/types/content.types';
import { useExploreData } from '@/hooks/useExploreData';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, Text, View } from 'react-native';

const EmptyState = () => (
  <View className="w-full flex-1 items-center justify-center bg-transparent px-10">
    <Image
      source={require('@/assets/images/search-empty-icon.png')}
      className="mb-6 h-[120px] w-[120px] opacity-60"
      resizeMode="contain"
    />
    <Text
      className="mb-2 text-center text-xl font-bold leading-tight dark:text-white"
      style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
      No featured events
    </Text>
    <Text className="text-center text-sm leading-relaxed text-gray-500 dark:text-gray-400">
      Check back soon — we&apos;re curating the next batch.
    </Text>
  </View>
);

export default function FeaturedEventsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, loading } = useExploreData();
  const events = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data.events;
    return data.events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
    );
  }, [data.events, searchQuery]);

  const displayData =
    loading && events.length === 0 ? Array(6).fill({}) : events;

  return (
    <AppSafeAreaView edges={['top']}>
      <ScreenHeader hasBorder={false} title="Featured Events" />
      <View className="mt-5 border-b-2 border-b-gray-200 px-5 pb-5 dark:border-b-dark-seconndary">
        <SearchInput
          placeholder='Try searching "Safari" or "Tanzania"'
          showFilter={false}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {!loading && events.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={displayData}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={{ gap: 16, marginBottom: 20 }}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 20,
            paddingTop: 10,
          }}
          keyExtractor={(item, index) =>
            loading && events.length === 0
              ? `skeleton-${index}`
              : (item as Event).id
          }
          renderItem={({ item, index }) =>
            loading && events.length === 0 ? (
              <View className="flex-1" style={{ maxWidth: '48%' }}>
                <EventCardSkeleton index={index} fullWidth />
              </View>
            ) : (
              <View className="flex-1" style={{ maxWidth: '48%' }}>
                <EventCard
                  event={item as Event}
                  index={index}
                  fullWidth
                  inlineEmoji
                />
              </View>
            )
          }
          ListEmptyComponent={<View />}
        />
      )}
    </AppSafeAreaView>
  );
}
