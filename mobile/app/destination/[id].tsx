import DetailNotFound from '@/components/experience/DetailNotFound';
import DestinationInfo from '@/components/destination/DestinationInfo';
import RecommendationsSection from '@/components/destination/RecommendationsSection';
import AddOnsForYou from '@/components/home/AddOnsForYou';
import DestinationCard from '@/components/home/DestinationCard';
import ItineraryForYou from '@/components/home/IteneryForYou';
import ItineraryHeader from '@/components/itinerary/ItineraryHeader';
import { Colors } from '@/constants';
import {
  DESTINATIONS_FOR_YOU,
  EXPERIENCE_HIGHLIGHTS,
  FEATURED_ITINERARIES,
} from '@/constants/home.constant';
import { useDetailItem } from '@/hooks/use-detail-item';
import React, { useMemo } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DestinationDetailScreen = () => {
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const colors = Colors[colorScheme];

  const {
    id,
    item: destination,
    loading,
  } = useDetailItem('destination') as {
    id: string;
    item: any;
    loading: boolean;
  };
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const featuredItineraries = useMemo(() => {
    return FEATURED_ITINERARIES.slice(0, 4);
  }, []);

  const similarDestinations = useMemo(() => {
    return DESTINATIONS_FOR_YOU.filter((d) => d.id !== id);
  }, [id]);

  // console.log('destination: ', JSON.stringify(destination, null, 2), loading);
  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!loading && !destination) {
    return <DetailNotFound type="itinerary" />;
  }

  return (
    <View className="flex-1">
      <ItineraryHeader
        scrollY={scrollY}
        imageUri={destination.image}
        title={destination.title}
      />

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}>
        <Image
          source={{ uri: destination.image }}
          className="h-[300px] w-full"
          resizeMode="cover"
        />

        <DestinationInfo
          title={destination.title}
          location={destination.location}
          rating={destination.rating || 4.5}
          description={destination.description || ''}
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

        <View>
          <AddOnsForYou
            data={EXPERIENCE_HIGHLIGHTS}
            title="Book an experience"
            subtitle="Unique tours and activities to enrich your adventure"
            loading={loading}
            showBorder={false}
          />
        </View>

        <View className="mt-5 h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        <RecommendationsSection />

        <View className="mt-5 h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        <View className="mt-8 pb-10">
          <Text
            className="mb-6 px-5 text-xl font-bold dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            Similar Destinations
          </Text>

          <FlatList
            data={similarDestinations}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View className="w-4" />}
            renderItem={({ item }) => (
              <DestinationCard
                item={item}
                fullWidth={false}
                width={170}
                imageHieght={100}
              />
            )}
          />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default DestinationDetailScreen;
