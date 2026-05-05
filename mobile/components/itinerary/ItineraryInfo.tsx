import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ItineraryInfoProps {
  title: string;
  activitiesCount: number;
  duration: string;
  description: string;
  durationMinutes?: number;
  cost?: number;
  currency?: string;
}

const ItineraryInfo = ({
  title,
  activitiesCount,
  duration,
  description,
  durationMinutes,
  cost,
  currency,
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
            🗓️ {durationMinutes ? `${durationMinutes} mins` : duration}
          </Text>
        </View>
        {cost && (
          <View className="flex-row items-center bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-full border border-green-200 dark:border-green-700/50">
            <Text className="text-xs font-bold text-green-700 dark:text-green-400">
              💰 ${cost} {currency || ""}
            </Text>
          </View>
        )}
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
