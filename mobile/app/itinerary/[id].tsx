import DetailNotFound from "@/components/experience/DetailNotFound";
import ItineraryCard from "@/components/home/ItineraryCard";
import DailyItinerary from "@/components/itinerary/DailyItinerary";
import ItineraryHeader from "@/components/itinerary/ItineraryHeader";
import ItineraryInfo from "@/components/itinerary/ItineraryInfo";
import WhatIsIncluded from "@/components/itinerary/WhatIsIncluded";
import { FEATURED_ITINERARIES } from "@/constants/home.constant";
import { useDetailItem } from "@/hooks/use-detail-item";
import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ItineraryTemplate } from "@/types/content.types";

const ItineraryDetail = () => {
  const { id, item: itinerary, loading } = useDetailItem("itinerary") as {
    id: string;
    item: ItineraryTemplate | null;
    loading: boolean;
  };
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const moreTrips = useMemo(() => {
    return FEATURED_ITINERARIES.slice(0, 3);
  }, []);

  if (loading) {
    return null;
  }

  if (!itinerary) {
    return <DetailNotFound type="itinerary" />;
  }

  return (
    <View className="flex-1">
      <ItineraryHeader
        scrollY={scrollY}
        imageUri={itinerary.image}
        title={itinerary.title}
      />

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
      >
        <Animated.Image
          source={{ uri: itinerary.image }}
          className="w-full h-[300px]"
          resizeMode="cover"
        />

        <ItineraryInfo
          title={itinerary.title}
          activitiesCount={itinerary.activities}
          duration={itinerary.duration}
          description={itinerary.description || ""}
        />

        <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20 mt-8" />

        <WhatIsIncluded items={itinerary.included || []} />

        <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20 mt-8" />

        <DailyItinerary itinerary={itinerary.dailyItinerary || []} />

        <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20 mt-8" />

        <View className="mt-5 pb-20">
          <Text
            className="px-5 text-xl font-bold dark:text-white mb-6"
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
          >
            More trips from New York
          </Text>

          <FlatList
            data={moreTrips}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View className="w-3" />}
            renderItem={({ item }) => (
              <ItineraryCard key={item.id} item={item} fullWidth={false} />
            )}
          />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default ItineraryDetail;
