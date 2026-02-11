import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { FlatList } from 'react-native';
import { SectionHeader, Spacer } from '@/components';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants';
import { ItineraryCard } from './ItineraryCard';
import { EventCard } from './EventCard';
import { ExperienceCard } from './ExperienceCard';
import { DestinationCard } from './DestinationCard';
import type { Experience, Destination, FeaturedEvent } from '@/types/explore';

interface ExploreSectionProps {
  title: string;
  linkTo: string;
  data: any[];
  type: 'itinerary' | 'event' | 'experience' | 'destination';
}

export const ExploreSection: React.FC<ExploreSectionProps> = ({
  title,
  linkTo,
  data,
  type,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: type === 'event' ? 12 : 0,
      marginBottom: 32,
    },
  });

  if (data.length === 0) return null;

  const renderCard = ({ item }: any) => {
    switch (type) {
      case 'itinerary':
        return <ItineraryCard item={item} />;
      case 'event':
        return <EventCard item={item} />;
      case 'experience':
        return <ExperienceCard item={item} />;
      case 'destination':
        return <DestinationCard item={item} />;
      default:
        return null;
    }
  };

  const ListComponent = type === 'event' ? FlatList : FlashList;
  const listProps =
    type === 'event'
      ? { scrollEnabled: false }
      : {
          horizontal: true,
          showsHorizontalScrollIndicator: false,
          contentContainerStyle: { paddingHorizontal: 12 },
        };

  return (
    <View style={styles.container}>
      <View className={`${type === 'event' ? 'px-0' : 'px-[12px]'}`}>
        <SectionHeader title={title} linkText="More →" linkTo={linkTo as any} />
      </View>
      <Spacer size={5} vertical />
      <ListComponent
        data={data}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        {...listProps}
      />
    </View>
  );
};
