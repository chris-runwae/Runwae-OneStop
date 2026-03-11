import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface MonthYearSelectorProps {
  currentMonthId: string;
  onMonthPress: () => void;
  onYearPress: () => void;
  theme?: any;
}

export const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({
  currentMonthId,
  onMonthPress,
  onYearPress,
  theme,
}) => {
  const getCurrentMonth = (monthId: string): string => {
    const date = new Date(monthId);
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  const getCurrentYear = (monthId: string): string => {
    const date = new Date(monthId);
    return date.getFullYear().toString();
  };

  return (
    <View className="mb-4 flex-row items-center gap-x-5 py-2">
      <TouchableOpacity
        onPress={onMonthPress}
        className="flex-row items-center gap-x-2">
        <Text className="text-base font-semibold text-black dark:text-white">
          {getCurrentMonth(currentMonthId)}
        </Text>
        <ChevronDown size={16} color={theme?.isDarkMode ? '#000' : '#fff'} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onYearPress}
        className="flex-row items-center gap-x-2">
        <Text className="text-base font-semibold text-black dark:text-white">
          {getCurrentYear(currentMonthId)}
        </Text>
        <ChevronDown size={16} color={theme?.isDarkMode ? '#000' : '#fff'} />
      </TouchableOpacity>
    </View>
  );
};
