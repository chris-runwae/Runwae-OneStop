import { useTheme } from '@react-navigation/native';
import { MoveRight } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showSubtitle?: boolean;
}

const SectionHeader = ({
  title,
  subtitle,
  onPress,
  showSubtitle = true,
}: SectionHeaderProps) => {
  const { dark } = useTheme();

  return (
    <View className="flex-row items-center justify-between px-[20px]">
      <View className="flex-1">
        <Text className="text-base font-medium dark:text-white">{title}</Text>
        {subtitle && showSubtitle && (
          <Text className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">
            {subtitle}
          </Text>
        )}
      </View>
      {onPress && (
        <TouchableOpacity
          onPress={onPress}
          className="h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-dark-seconndary">
          <MoveRight
            size={14}
            strokeWidth={2}
            color={dark ? '#ffffff' : '#000000'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader;
