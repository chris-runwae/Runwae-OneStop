import { DestinationCardSkeleton } from "@/components/ui/CardSkeletons";
import SectionHeader from "@/components/ui/SectionHeader";
import { Destination } from "@/constants/home.constant";
import { router } from "expo-router";
import React from "react";
import { FlatList, Text, View } from "react-native";
import DestinationCard from "./DestinationCard";

interface DestinationsForYouProps {
  data: Destination[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

const DestinationsForYou = ({
  data,
  title = "Destinations you might like",
  subtitle = "Places that everyone else is crazy about",
  loading = false,
}: DestinationsForYouProps) => {
  const displayData = loading ? Array(5).fill({}) : data;

  return (
    <View className="mt-5">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        onPress={() => router.push("/(tabs)/explore/destination")}
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
          loading ? (
            <DestinationCardSkeleton />
          ) : (
            <DestinationCard item={item} />
          )
        }

        ListEmptyComponent={
          <View className="flex items-center justify-center w-full py-8">
            <Text className="text-3xl mb-3">🌍</Text>
            <Text
              className="font-semibold text-base dark:text-white"
              style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            >
              No destinations found
            </Text>
            <Text className="text-xs text-gray-400 mt-1 text-center">
              Check back for popular destinations!
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default DestinationsForYou;
