import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Star } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import type { DiscoveryItem } from './types';
import { PROVIDER_LABELS } from './types';

interface DiscoverAddOnCardProps {
  item: DiscoveryItem;
  index?: number;
  fullWidth?: boolean;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80';

const DiscoverAddOnCard: React.FC<DiscoverAddOnCardProps> = ({
  item,
  index = 0,
  fullWidth = false,
}) => {
  const isNavigating = React.useRef(false);

  const handlePress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    if (item.provider === 'viator') {
      router.push({
        pathname: '/viator/[productCode]',
        params: { productCode: item.apiRef },
      });
    } else {
      router.push({
        pathname: '/experiences-search/detail',
        params: {
          provider: item.provider,
          apiRef: item.apiRef,
          category: item.category,
          title: item.title,
          imageUrl: item.imageUrl ?? '',
          externalUrl: item.externalUrl ?? '',
        },
      });
    }
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  const isEven = index % 2 === 0;
  const heroSource = useMemo(
    () => ({ uri: item.imageUrl || FALLBACK_IMAGE }),
    [item.imageUrl],
  );

  return (
    <Pressable
      onPress={handlePress}
      className="mr-4 bg-white/0"
      style={{ width: fullWidth ? '100%' : 300 }}>
      <View className="relative mb-3 h-[180px] w-full rounded-[10px] bg-gray-100 dark:bg-dark-seconndary/50">
        <View className="h-full w-full overflow-hidden rounded-[10px]">
          <Image
            source={heroSource}
            className="h-full w-full rounded-[10px]"
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={180}
            recyclingKey={item.imageUrl || item.apiRef}
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
            source={heroSource}
            className="h-full w-full"
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={180}
            recyclingKey={`${item.apiRef}-small`}
          />
        </View>
      </View>

      <Text
        className="px-2 text-[11px] font-bold uppercase tracking-wide text-pink-500"
        numberOfLines={1}>
        via {PROVIDER_LABELS[item.provider] ?? item.provider}
      </Text>

      <Text
        className="mb-1.5 mt-1 px-2 text-[14px] leading-tight text-black dark:text-white"
        numberOfLines={2}>
        {item.title}
      </Text>

      <View className="flex-row items-center px-2">
        {item.rating ? (
          <>
            <View className="flex-row items-center">
              <Star size={11} color="#FFD700" fill="#FFD700" />
              <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                {item.rating.toFixed(1)}
              </Text>
            </View>
            <View className="mx-2 h-3 w-[1px] bg-gray-300 dark:bg-gray-600" />
          </>
        ) : null}
        {item.price ? (
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            from {item.currency ?? 'USD'} {Math.round(item.price)}
          </Text>
        ) : item.locationName ? (
          <Text
            className="flex-1 text-xs text-gray-500 dark:text-gray-400"
            numberOfLines={1}>
            {item.locationName}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

export default DiscoverAddOnCard;
