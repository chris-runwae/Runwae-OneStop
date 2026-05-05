import React from 'react';
import { ScrollView, View } from 'react-native';
import {
  AddOnCardSkeleton,
  DestinationCardSkeleton,
  EventCardSkeleton,
  ExploreCategoriesSkeleton,
  ItineraryCardSkeleton,
  SectionHeaderSkeleton,
} from './CardSkeletons';

const ExploreSkeleton = () => {
  return (
    <View className="flex-1">
      <ExploreCategoriesSkeleton />

      {/* Featured Trip Itineraries */}
      <View className="mt-5">
        <SectionHeaderSkeleton showSubtitle={true} />
        <ScrollView
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, marginTop: 10 }}>
          {[1, 2, 3].map((_, i) => (
            <View key={i} className="mr-3">
              <ItineraryCardSkeleton />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Upcoming Events */}
      <View className="mt-8">
        <SectionHeaderSkeleton showSubtitle={true} />
        <ScrollView
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, marginTop: 16 }}>
          {[1, 2, 3, 4].map((_, i) => (
            <View key={i} className="mr-3">
              <EventCardSkeleton index={i} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Experience Highlights */}
      <View className="mt-8">
        <SectionHeaderSkeleton showSubtitle={true} />
        <ScrollView
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, marginTop: 30 }}>
          {[1, 2, 3].map((_, i) => (
            <View key={i} className="mr-3">
              <AddOnCardSkeleton index={i} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Popular Destinations */}
      <View className="mt-8">
        <SectionHeaderSkeleton showSubtitle={true} />
        <ScrollView
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, marginTop: 16 }}>
          {[1, 2, 3].map((_, i) => (
            <View key={i} className="mr-3">
              <DestinationCardSkeleton />
            </View>
          ))}
        </ScrollView>
      </View>

    </View>
  );
};

export default ExploreSkeleton;
