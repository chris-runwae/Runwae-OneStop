import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ItineraryInfoProps {
  title: string;
  activitiesCount: number;
  duration: string;
  description: string;
}

const ItineraryInfo = ({
  title,
  activitiesCount,
  duration,
  description,
}: ItineraryInfoProps) => {
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
        <View className="flex-row items-center bg-gray-100 dark:bg-dark-seconndary px-2 py-2 rounded-full border border-gray-200 dark:border-white/10">
          <Text className="text-xs font-medium dark:text-gray-300">
            📍 {activitiesCount} activities
          </Text>
        </View>
        <View className="flex-row items-center bg-gray-100 dark:bg-dark-seconndary px-3 py-2 rounded-full border border-gray-200 dark:border-white/10">
          <Text className="text-xs font-medium dark:text-gray-300">
            🗓️ {duration}
          </Text>
        </View>
      </View>

      <View>
        <Text
          className="text-gray-500 dark:text-gray-400 leading-6"
          numberOfLines={isExpanded ? undefined : 3}
        >
          {description}
        </Text>
        {!isExpanded && (
          <TouchableOpacity onPress={() => setIsExpanded(true)}>
            <Text className="text-primary underline mt-1">More</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ItineraryInfo;
