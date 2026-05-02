import { AddOnItinerary } from "@/constants/home.constant";
import React from "react";
import { Image, Text, View } from "react-native";

interface ExperienceItineraryProps {
  items: AddOnItinerary[];
}

const ExperienceItinerary = ({ items }: ExperienceItineraryProps) => {
  if (!items || items.length === 0) return null;

  return (
    <View className="px-5 mt-5">
      <Text
        className="text-black dark:text-white text-xl font-bold mb-3"
        style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
      >
        Itinerary
      </Text>
      <View className="gap-y-3">
        {items.map((item, index) => (
          <View key={index} className="flex-row gap-x-3">
            <View className="w-[80px] h-[80px] rounded-[8px] overflow-hidden border border-gray-100 dark:border-dark-seconndary">
              <Image
                source={{ uri: item.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View className="flex-1 justify-center">
              <Text
                className="text-black dark:text-white text-lg font-bold mb-1"
                style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
              >
                {item.title}
              </Text>
              <Text
                className="text-gray-500 dark:text-gray-400 text-sm leading-snug"
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ExperienceItinerary;
