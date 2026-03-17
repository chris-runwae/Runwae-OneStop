import { ItineraryCardSkeleton } from "@/components/ui/CardSkeletons";
import SectionHeader from "@/components/ui/SectionHeader";
import { Itinerary } from "@/constants/home.constant";
import { router } from "expo-router";
import React from "react";
import { FlatList, Text, View } from "react-native";
import ItineraryCard from "./ItineraryCard";

interface ItineraryForYouProps {
  data: Itinerary[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

const ItineraryForYou = ({
  data,
  title = "Itineraries for you",
  subtitle = "Curated specially for you based on your preferences",
  loading = false,
}: ItineraryForYouProps) => {
  const displayData = loading ? Array(5).fill({}) : data;

  return (
    <View className="mt-5 border-b-[3px] border-b-gray-200 dark:border-b-dark-seconndary pb-5">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        onPress={() => router.push("/(tabs)/explore/itinerary")}
      />

      <FlatList
        data={displayData}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          marginTop: 16,
          paddingHorizontal: 20,
        }}
        keyExtractor={(item, index) => (loading ? `skeleton-${index}` : item.id)}
        ItemSeparatorComponent={() => <View className="w-3" />}
        renderItem={({ item }) =>
          loading ? <ItineraryCardSkeleton /> : <ItineraryCard item={item} />
        }

        ListEmptyComponent={
          <View className="flex items-center justify-center w-full py-8">
            <Text className="text-3xl mb-3">🗺️</Text>
            <Text
              className="font-semibold text-base dark:text-white"
              style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            >
              No itineraries yet
            </Text>
            <Text className="text-xs text-gray-400 mt-1 text-center">
              Check back soon for curated travel ideas!
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default ItineraryForYou;
