import DestinationInfo from '@/components/destination/DestinationInfo';
import RecommendationsSection from '@/components/destination/RecommendationsSection';
import DetailNotFound from '@/components/experience/DetailNotFound';
import AddOnsForYou from '@/components/home/AddOnsForYou';
import DestinationCard from '@/components/home/DestinationCard';
import ItineraryForYou from '@/components/home/IteneryForYou';
import ItineraryHeader from '@/components/itinerary/ItineraryHeader';
import {
  ADD_ONS_FOR_YOU,
  EXPERIENCE_HIGHLIGHTS,
  FEATURED_ITINERARIES,
} from '@/constants/home.constant';
import React, { useMemo } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useDestinationById, useDestinations } from '@/hooks/useDestinations';
import { FlashList } from '@shopify/flash-list';

const DestinationDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { destination, loading } = useDestinationById(id ?? null);
  const { destinations } = useDestinations();

  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const featuredItineraries = useMemo(
    () => FEATURED_ITINERARIES.slice(0, 4),
    []
  );

  const similarDestinations = useMemo(() => {
    if (!id) return destinations;
    return destinations.filter((d) => d.id !== id);
  }, [id, destinations]);

  if (loading) {
    return null; // swap for a skeleton if you have one
  }

  if (!destination) {
    return <DetailNotFound type="destination" />;
  }

  return (
    <View className="flex-1">
      <ItineraryHeader
        scrollY={scrollY}
        imageUri={destination?.image ?? ''}
        title={destination.title}
      />

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}>
        <Image
          source={{ uri: destination.image ?? undefined }}
          className="h-[300px] w-full"
          resizeMode="cover"
        />

        <DestinationInfo
          title={destination.title}
          location={destination.location}
          rating={destination.rating ?? 4.5}
          description={destination.description ?? ''}
        />

        <View className="mt-5 h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        <ItineraryForYou
          data={featuredItineraries}
          title="Featured Itineraries"
          showSubtitle={false}
          showBorder={false}
          loading={loading}
        />

        <View className="mt-5 h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        {/* <AddOnsForYou
          data={EXPERIENCE_HIGHLIGHTS}
          title="Book an experience"
          subtitle="Unique tours and activities to enrich your adventure"
          loading={loading}
          showBorder={false}
        /> */}

        <View className="mt-5 h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        <RecommendationsSection />

        <View className="mt-5 h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        <View className="mt-8 pb-10">
          <Text
            className="mb-6 px-5 text-xl font-bold dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            Similar Destinations
          </Text>

          <FlashList
            data={similarDestinations}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
            }}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View className="w-4" />}
            renderItem={({ item }) => (
              <DestinationCard
                item={item}
                fullWidth={false}
                width={170}
                imageHeight={100}
              />
            )}
          />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default DestinationDetailScreen;
