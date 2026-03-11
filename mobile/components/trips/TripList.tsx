import React, { useCallback, useMemo } from 'react';
import { View, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { WideTripCard } from '@/components';
import { Trip } from '@/types/trips.types';
import TripEmptyState from './TripEmptyState';

interface TripListProps {
  trips: Trip[];
  loading: boolean;
  onRefresh: () => void;
}

const TripList: React.FC<TripListProps> = ({ trips, loading, onRefresh }) => {
  const renderItem = useCallback(
    ({ item }: { item: Trip }) => <WideTripCard data={[item]} />,
    []
  );

  const ListEmptyComponent = useMemo(() => <TripEmptyState />, []);

  const ListFooterComponent = useMemo(() => <View className="h-[100px]" />, []);

  const ItemSeparatorComponent = useMemo(
    () => () => <View className="h-2" />,
    []
  );

  if (trips.length === 0) {
    return <TripEmptyState />;
  }

  return (
    <FlashList
      data={trips}
      renderItem={renderItem}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
      getItemType={(item) => 'trip'}
    />
  );
};

export default TripList;
