import { AddOnCardSkeleton } from "@/components/ui/CardSkeletons";
import SectionHeader from "@/components/ui/SectionHeader";
import { AddOn } from "@/constants/home.constant";
import { router } from "expo-router";
import React from "react";

import { FlatList, Text, View } from "react-native";
import AddOnCard from "./AddOnCard";

interface AddOnsForYouProps {
  data: AddOn[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

const AddOnsForYou = ({
  data,
  title = "Add-ons for your Trips",
  subtitle = "Explore experiences to enhance your current travel plans",
  loading = false,
}: AddOnsForYouProps) => {
  const displayData = loading ? Array(5).fill({}) : data;

  return (
    <View className="mt-5 border-b-[3px] border-b-gray-200 dark:border-b-dark-seconndary pb-5">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        onPress={() => router.push("/(tabs)/explore/experience")}
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
        keyExtractor={(item, index) =>
          loading ? `skeleton-${index}` : item.id
        }
        ItemSeparatorComponent={() => <View className="w-3" />}
        renderItem={({ item }) =>
          loading ? <AddOnCardSkeleton /> : <AddOnCard item={item} />
        }
        ListEmptyComponent={
          <View className="flex items-center justify-center w-full py-8">
            <Text className="text-3xl mb-3">🎫</Text>
            <Text
              className="font-semibold text-base dark:text-white"
              style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            >
              No activities found
            </Text>
            <Text className="text-xs text-gray-400 mt-1 text-center">
              Check back for deals and activities!
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default AddOnsForYou;
