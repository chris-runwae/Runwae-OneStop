import { Destination } from "@/constants/home.constant";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface DestinationCardProps {
  item: Destination;
}

const DestinationCard = ({ item }: DestinationCardProps) => (
  <TouchableOpacity className="mr-3" style={{ width: 240 }}>
    <Image
      source={{ uri: item.image }}
      className="w-full h-[200px] rounded-t-[16px]"
      resizeMode="cover"
    />
    <View className="mt-3">
      <Text
        className="text-black dark:text-white font-semibold text-lg leading-tight mb-1"
        numberOfLines={1}
      >
        {item.title}
      </Text>

      <Text
        className="text-gray-500 dark:text-gray-400 text-sm leading-snug"
        numberOfLines={1}
      >
        {item.location}
      </Text>
    </View>
  </TouchableOpacity>
);

export default DestinationCard;
