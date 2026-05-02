import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface RadioOptionsProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}

const RadioOptions: React.FC<RadioOptionsProps> = ({
  title,
  subtitle,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0`}
    >
      <View className="flex-1 mr-3">
        <Text className="font-semibold text-base text-gray-900 dark:text-gray-100">
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-sm text-gray-400 mt-0.5">{subtitle}</Text>
        ) : null}
      </View>
      <View
        className={`h-6 w-6 rounded-full border items-center justify-center ${
          selected ? "border-primary" : "border-gray-300 dark:border-gray-600"
        }`}
      >
        {selected && <View className="h-3 w-3 rounded-full bg-primary" />}
      </View>
    </TouchableOpacity>
  );
};

export default RadioOptions;
