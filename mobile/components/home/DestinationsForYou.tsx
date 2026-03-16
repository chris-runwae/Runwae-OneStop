import SectionHeader from "@/components/ui/SectionHeader";
import { Destination } from "@/constants/home.constant";
import React from "react";
import { FlatList, Text, View } from "react-native";
import DestinationCard from "./DestinationCard";

interface DestinationsForYouProps {
  data: Destination[];
  title?: string;
  subtitle?: string;
}

const DestinationsForYou = ({
  data,
  title = "Destinations you might like",
  subtitle = "Places that everyone else is crazy about",
}: DestinationsForYouProps) => {
  return (
    <View className="mt-5">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        onPress={() => {}}
      />

      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          marginTop: 16,
          paddingHorizontal: 20,
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DestinationCard item={item} />}
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
