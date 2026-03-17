import ItineraryCard from "@/components/home/ItineraryCard";
import DailyItinerary from "@/components/itinerary/DailyItinerary";
import ItineraryHeader from "@/components/itinerary/ItineraryHeader";
import ItineraryInfo from "@/components/itinerary/ItineraryInfo";
import WhatIsIncluded from "@/components/itinerary/WhatIsIncluded";
import {
  FEATURED_ITINERARIES,
  ITINERARIES_FOR_YOU,
} from "@/constants/home.constant";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

const ItineraryDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const itinerary = useMemo(() => {
    const allItineraries = [...ITINERARIES_FOR_YOU, ...FEATURED_ITINERARIES];
    return allItineraries.find((item) => item.id === id);
  }, [id]);

  const moreTrips = useMemo(() => {
    return FEATURED_ITINERARIES.slice(0, 3);
  }, []);

  if (!itinerary) {
    return (
      <View className="flex-1 bg-white dark:bg-dark items-center justify-center px-8">
        <Image
          source={require("@/assets/images/search-empty-icon.png")}
          className="w-32 h-32 mb-8 opacity-60"
          resizeMode="contain"
        />
        <Text
          className="text-2xl font-bold dark:text-white text-center mb-2"
          style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
        >
          Itinerary not found
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center text-base leading-6 mb-10">
          We couldn't find the itinerary you're looking for. It might have been
          removed or the link is incorrect.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/explore")}
          className="bg-[#FF2E92] px-10 py-4 rounded-full shadow-lg"
          style={{ elevation: 5 }}
        >
          <Text className="text-white font-bold text-lg">
            Return to Explore
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View key={id as string} className="flex-1 bg-white dark:bg-dark">
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
      >
        <Image
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

        <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20 mt-10" />

        <DailyItinerary itinerary={itinerary.dailyItinerary || []} />

        <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        <View className="mt-5 pb-32">
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
