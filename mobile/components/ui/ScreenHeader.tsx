import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  hasBorder?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  hasBorder = true,
}) => {
  const { dark } = useTheme();

  return (
    <View
      className={`flex flex-row items-center gap-x-5 pt-5 px-[20px] ${
        hasBorder
          ? "pb-5 border-b-2 border-b-gray-200 dark:border-b-dark-seconndary"
          : "pb-0"
      }`}
    >


      <TouchableOpacity
        onPress={onBack || (() => router.back())}
        className="h-[35px] w-[35px] flex items-center justify-center rounded-full bg-gray-200 dark:bg-dark-seconndary"
      >
        <ArrowLeft
          size={18}
          strokeWidth={1.5}
          color={dark ? "#ffffff" : "#000000"}
        />
      </TouchableOpacity>
      <View className="flex-1">
        <Text
          className="font-semibold text-2xl text-black dark:text-white"
          style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-sm text-gray-400">{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
};

export default ScreenHeader;
