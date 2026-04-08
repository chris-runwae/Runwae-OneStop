import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ExperienceInfoProps {
  title: string;
  price: number;
  description: string;
  category: string;
}

const ExperienceInfo = ({
  title,
  price,
  description,
  category,
}: ExperienceInfoProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View className="px-5 pt-6">
      <Text
        className="text-xl font-bold dark:text-white mb-2"
        style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
      >
        {title}
      </Text>

      <View className="flex-row items-baseline gap-x-1 mb-4">
        <Text className="font-bold dark:text-white">${price}</Text>
        <Text className="text-gray-400 text-sm">starting price/person</Text>
      </View>

      <View className="flex-row mb-6">
        <View className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md border border-green-100 dark:border-green-800/30">
          <Text className="text-green-600 dark:text-green-400 text-xs font-semibold">
            Free Cancellation
          </Text>
        </View>
      </View>

      <View>
        <Text
          className="text-gray-500 dark:text-gray-400 leading-6 text-sm"
          numberOfLines={isExpanded ? undefined : 3}
        >
          {description}
        </Text>
        {!isExpanded && (
          <TouchableOpacity onPress={() => setIsExpanded(true)}>
            <Text className="text-primary font-semibold mt-1">More</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row items-center mt-3 gap-x-2">
        <View className="flex-row">
          {[1, 2, 3, 4].map((i) => (
            <Image
              key={i}
              source={{ uri: `https://i.pravatar.cc/100?img=${i}` }}
              className="w-8 h-8 rounded-full border border-white dark:border-gray-600 -ml-2"
              style={{ marginLeft: i === 1 ? 0 : -10 }}
            />
          ))}
          <View
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-seconndary border-2 border-white dark:border-gray-600 items-center justify-center -ml-2"
            style={{ marginLeft: -10 }}
          >
            <Text className="text-xs text-gray-500">+2k</Text>
          </View>
        </View>
        <Text className="text-gray-400 text-xs">added to their trip</Text>
      </View>
    </View>
  );
};

export default ExperienceInfo;
