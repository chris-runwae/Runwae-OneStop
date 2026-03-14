import { useTheme } from "@react-navigation/native";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const OptionButtons = ({
  title,
  icon,
  badge,
  badgeText,
  onPress,
}: {
  title: string;
  icon: React.ElementType | React.ReactElement;
  badge?: boolean;
  badgeText?: string;
  onPress: () => void;
}) => {
  const { dark } = useTheme();
  const iconColor = dark ? "#ffffff" : "#343A40";

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<{ color?: string }>, {
        color: iconColor,
      });
    }
    const Icon = icon as React.ElementType;
    return <Icon size={15} color={iconColor} />;
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-b-gray-100 py-4 dark:border-b-dark-seconndary"
    >
      <View className="flex-row items-center gap-x-2">
        <View className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-gray-100 dark:bg-dark-seconndary">
          {renderIcon()}
        </View>
        <Text className="text-base font-semibold text-black dark:text-white">
          {title}
        </Text>
      </View>

      {badge ? (
        <View className="flex items-center justify-center rounded-full bg-primary/10 px-[15px] py-[8px] dark:bg-primary/10">
          <Text className="text-xs font-semibold text-primary dark:text-primary">
            {badgeText}
          </Text>
        </View>
      ) : (
        <ChevronRight size={15} color={dark ? "#ffffff" : "#ADB5BD"} />
      )}
    </TouchableOpacity>
  );
};

export default OptionButtons;
