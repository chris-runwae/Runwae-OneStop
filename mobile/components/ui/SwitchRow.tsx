import { useTheme } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";
import CustomSwitch from "./CustomSwitch";

interface SwitchRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const SwitchRow: React.FC<SwitchRowProps> = ({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}) => {
  const { dark } = useTheme();

  return (
    <View className="flex-row items-center justify-between py-1">
      <View className="flex-1 mr-4">
        <Text className="text-base font-semibold text-gray-700 dark:text-gray-200">
          {label}
        </Text>
        {description ? (
          <Text className="text-sm text-gray-400 mt-0.5 leading-relaxed">
            {description}
          </Text>
        ) : null}
      </View>
      <CustomSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        activeColor="#038F46"
        inactiveColor="#ADB5BD"
      />
    </View>
  );
};

export default SwitchRow;
