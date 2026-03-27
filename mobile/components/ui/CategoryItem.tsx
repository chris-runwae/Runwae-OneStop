import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

const CategoryItem = ({
  icon,
  imageSrc,
  label,
  isActive,
  onPress,
}: {
  icon?: string;
  imageSrc?: any;
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}) => (
  <Pressable
    className="flex-1 items-center justify-between pt-2"
    onPress={onPress}>
    <View className="items-center justify-center gap-y-2 pb-4">
      <View className="h-fit w-fit items-center justify-center rounded-[16px] bg-transparent pb-1">
        {imageSrc ? (
          <Image
            source={imageSrc}
            className="h-[48px] w-[48px]"
            resizeMode="contain"
          />
        ) : (
          <Text className="text-2xl">{icon}</Text>
        )}
      </View>
      <Text
        className={`text-[13px] ${isActive ? 'font-bold text-black dark:text-white' : 'font-medium text-gray-400'}`}>
        {label}
      </Text>
    </View>
    <View className="h-[3px] w-full bg-transparent" />
  </Pressable>
);

export default CategoryItem;
