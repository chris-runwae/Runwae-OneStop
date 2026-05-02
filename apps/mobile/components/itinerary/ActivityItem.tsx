import React from "react";
import { Text, View } from "react-native";

interface ActivityItemProps {
  title: string;
  description: string;
}

const ActivityItem = ({ title, description }: ActivityItemProps) => {
  return (
    <View className="mb-8">
      <Text className="font-bold text-base dark:text-white mb-2">
        {title}
      </Text>
      <Text className="text-gray-400 text-sm leading-6">
        {description}
      </Text>
    </View>
  );
};

export default ActivityItem;
