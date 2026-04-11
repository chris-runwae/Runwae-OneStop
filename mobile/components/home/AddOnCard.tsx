import { Experience } from '@/types/content.types';
import { useRouter } from 'expo-router';
import { Users } from 'lucide-react-native';
import React from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';

interface AddOnCardProps {
  item: Experience;
  index?: number;
  fullWidth?: boolean;
}

const AddOnCard = ({ item, index = 0, fullWidth = false }: AddOnCardProps) => {
  const router = useRouter();
  const isNavigating = React.useRef(false);

  const handlePress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.navigate(`/experience/${item.id}`);
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  const isEven = index % 2 === 0;
  const smallImage = item.gallery?.[1] || item.image; // Use second gallery image for the overlay if available

  return (
    <Pressable
      onPress={handlePress}
      className={`mr-4 bg-white/0`}
      style={{ width: fullWidth ? '100%' : 300 }}>
      <View className="relative mb-3 h-[180px] w-full rounded-[10px] bg-gray-100 dark:bg-dark-seconndary/50">
        <View className="h-full w-full overflow-hidden rounded-[10px]">
          <Image
            source={{ uri: item.image }}
            className="h-full w-full rounded-[10px]"
            resizeMode="cover"
          />
        </View>

        <View
          className={`absolute h-[72px] w-[72px] overflow-hidden rounded-[10px] border-[3px] border-white dark:border-dark-bg bg-gray-200 dark:bg-dark-seconndary ${
            isEven
              ? 'bottom-[-16px] left-[16px]'
              : 'left-[20px] top-[-16px] -rotate-12 transform'
          }`}
          style={
            Platform.OS === 'ios'
              ? {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                }
              : { elevation: 4 }
          }>
          <Image
            source={{ uri: smallImage }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>
      </View>

      <Text
        className="mb-1.5 mt-2 px-2 text-[14px] leading-tight text-black dark:text-white"
        numberOfLines={1}>
        {item.title}
      </Text>

      <View className="flex-row items-center px-2">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          Apr 1 - 6
        </Text>
        <View className="mx-2 h-3 w-[1px] bg-gray-300 dark:bg-gray-600" />
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          ${item.price} - ${item.price * 3}
        </Text>
        <View className="mx-2 h-3 w-[1px] bg-gray-300 dark:bg-gray-600" />
        <View className="flex-row items-center">
          <Users size={14} color="#ec4899" strokeWidth={2.5} />
          <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">
            {item.reviewCount ? Math.floor(item.reviewCount / 10) : 6} people
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default AddOnCard;
