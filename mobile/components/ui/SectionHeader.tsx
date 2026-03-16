import { useTheme } from "@react-navigation/native";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

const SectionHeader = ({ title, subtitle, onPress }: SectionHeaderProps) => {
  const { dark } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="px-[20px] flex-row items-center gap-x-2"
    >
      <View>
        <View className="flex-row items-center gap-x-1">
          <Text
            className="font-semibold text-lg dark:text-white"
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
          >
            {title}
          </Text>
          {onPress && (
            <ChevronRight
              size={17}
              strokeWidth={1.5}
              color={dark ? "#ffffff" : "#000000"}
            />
          )}
        </View>
        {subtitle && (
          <Text className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SectionHeader;
