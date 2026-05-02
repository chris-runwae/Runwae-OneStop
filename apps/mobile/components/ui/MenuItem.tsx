import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MenuItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  hasBorder?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  title,
  subtitle,
  onPress,
  rightElement,
  hasBorder = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center justify-between py-4 ${hasBorder ? "border-b border-b-gray-100 dark:border-b-gray-800" : ""}`}
    >
      <View className="flex-1 mr-3">
        <Text className="font-semibold text-base text-black dark:text-white">
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-sm text-gray-400 mt-0.5">{subtitle}</Text>
        ) : null}
      </View>
      {rightElement ?? (
        <ChevronRight size={18} strokeWidth={1.5} color={"#9ca3af"} />
      )}
    </TouchableOpacity>
  );
};

export default MenuItem;
