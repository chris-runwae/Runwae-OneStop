import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Pressable,
  StyleProp,
  ViewStyle,
  Text,
  View,
} from 'react-native';
import { Destination } from '@/hooks/useDestinations';

interface DestinationCardProps {
  item: Destination;
  fullWidth?: boolean;
  width?: number;
  imageHeight?: number;
  style?: StyleProp<ViewStyle>;
}

const DestinationCard = ({
  item,
  fullWidth = false,
  width = 240,
  imageHeight = 200,
  style,
}: DestinationCardProps) => {
  const router = useRouter();
  const isNavigating = React.useRef(false);

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
      style={[style, { width: fullWidth ? '100%' : width }]}>
      <Image
        source={{
          uri:
            item?.image ??
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
        }}
        className="w-full rounded-t-[16px]"
        style={{ height: imageHeight }}
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
