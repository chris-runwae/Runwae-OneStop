import { Destination } from '@/constants/home.constant';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

interface DestinationCardProps {
  item: Destination;
  fullWidth?: boolean;
  width?: number;
  imageHieght?: number;
}

const DestinationCard = ({
  item,
  fullWidth = false,
  width = 240,
  imageHieght = 200,
}: DestinationCardProps) => {
  const router = useRouter();
  const isNavigating = React.useRef(false);

  console.log('item: ', JSON.stringify(item?.id, null, 2));

  const handlePress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.navigate(`/destination/${item.id}`);
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  return (
    <Pressable
      onPress={handlePress}
      className={fullWidth ? '' : 'mr-3'}
      style={{ width: fullWidth ? '100%' : width }}>
      <Image
        source={{ uri: item.image }}
        className={`w-full h-[${imageHieght}px] rounded-t-[16px]`}
        resizeMode="cover"
      />
      <View className="mt-3">
        <Text
          className="mb-1 text-lg font-semibold leading-tight text-black dark:text-white"
          numberOfLines={1}
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
          {item.title}
        </Text>

        <Text
          className="text-sm leading-snug text-gray-500 dark:text-gray-400"
          numberOfLines={1}>
          {item.location}
        </Text>
      </View>
    </Pressable>
  );
};

export default DestinationCard;
