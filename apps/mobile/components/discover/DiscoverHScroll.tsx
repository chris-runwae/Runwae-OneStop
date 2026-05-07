import {
  AddOnCardSkeleton,
  EventCardSkeleton,
} from '@/components/ui/CardSkeletons';
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import DiscoverAddOnCard from './DiscoverAddOnCard';
import DiscoverEventCard, { type EventCardInput } from './DiscoverEventCard';
import type { DiscoveryItem } from './types';

type CardVariant = 'addOn' | 'event';

interface DiscoverHScrollProps {
  items: DiscoveryItem[] | null;
  cardVariant: CardVariant;
  // Used only when `cardVariant === 'event'` to mix DB events alongside
  // external Ticketmaster items in the same scroller.
  dbEvents?: EventCardInput[];
  emptyHint?: string;
}

const DiscoverHScroll: React.FC<DiscoverHScrollProps> = ({
  items,
  cardVariant,
  dbEvents = [],
  emptyHint = 'No matches yet — try a different search.',
}) => {
  const loading = items === null;

  if (loading) {
    const SkeletonComp =
      cardVariant === 'event' ? EventCardSkeleton : AddOnCardSkeleton;
    return (
      <FlatList
        data={Array.from({ length: 5 }).map((_, i) => i)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        keyExtractor={(i) => `skel-${i}`}
        ItemSeparatorComponent={
          cardVariant === 'addOn' ? () => <View className="w-3" /> : undefined
        }
        renderItem={({ item }) => <SkeletonComp index={item} />}
      />
    );
  }

  if (cardVariant === 'event') {
    const merged: EventCardInput[] = [
      ...dbEvents,
      ...(items ?? []).map(
        (it) => ({ kind: 'external' as const, item: it }),
      ),
    ];
    if (merged.length === 0) {
      return <EmptyHint hint={emptyHint} />;
    }
    return (
      <FlatList
        data={merged}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        keyExtractor={(input, idx) =>
          input.kind === 'db'
            ? `db:${input.id}`
            : `ext:${input.item.provider}:${input.item.apiRef}:${idx}`
        }
        renderItem={({ item, index }) => (
          <DiscoverEventCard input={item} index={index} />
        )}
      />
    );
  }

  if (!items || items.length === 0) {
    return <EmptyHint hint={emptyHint} />;
  }

  return (
    <FlatList
      data={items}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      keyExtractor={(item, idx) => `${item.provider}:${item.apiRef}:${idx}`}
      ItemSeparatorComponent={() => <View className="w-3" />}
      renderItem={({ item, index }) => (
        <DiscoverAddOnCard item={item} index={index} />
      )}
    />
  );
};

const EmptyHint: React.FC<{ hint: string }> = ({ hint }) => (
  <View className="px-[20px] py-6">
    <Text className="text-sm text-gray-400 dark:text-gray-500">{hint}</Text>
  </View>
);

export default DiscoverHScroll;
