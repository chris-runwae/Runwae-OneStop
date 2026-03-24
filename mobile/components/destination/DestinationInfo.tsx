import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface DestinationInfoProps {
  title: string;
  location: string;
  rating: number;
  description: string;
}

const DestinationInfo = ({
  title,
  location,
  rating,
  description,
}: DestinationInfoProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View className="px-5 pt-6">
      <Text
        className="text-2xl font-bold dark:text-white mb-4"
        style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
      >
        {title}
      </Text>

      <View className="flex-row items-center gap-x-3 mb-6">
        <View className="flex-row items-center bg-gray-100 dark:bg-dark-seconndary px-3 py-2 rounded-full border border-gray-200 dark:border-white/10">
          <Text className="text-xs font-medium dark:text-gray-300">
            📍 {location}
          </Text>
        </View>
        <View className="flex-row items-center bg-gray-100 dark:bg-dark-seconndary px-3 py-2 rounded-full border border-gray-200 dark:border-white/10">
          <Text className="text-xs font-medium dark:text-gray-300">
            ⭐️ {rating}
          </Text>
        </View>
      </View>

      <View>
        <Text
          className="text-gray-500 dark:text-gray-400 leading-6"
          numberOfLines={isExpanded ? undefined : 3}
          style={{ fontFamily: "Inter" }}
        >
          {description}
        </Text>
        {!isExpanded && (
          <TouchableOpacity onPress={() => setIsExpanded(true)}>
            <Text className="text-primary underline mt-1 font-medium">More</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default DestinationInfo;
