import { mapViatorProductToExperience } from '@/utils/viator/mapViatorProductToExperience';
import type { ViatorProduct } from '@/types/viator.types';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';

interface ViatorProductCardProps {
  product: ViatorProduct;
  index?: number;
  fullWidth?: boolean;
}

function formatDurationMinutes(m?: number): string {
  if (m == null) return '—';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min ? `${h}h ${min}m` : `${h}h`;
}

const ViatorProductCard = ({
  product,
  index = 0,
  fullWidth = false,
}: ViatorProductCardProps) => {
  const router = useRouter();
  const isNavigating = React.useRef(false);

  const experience = useMemo(
    () => mapViatorProductToExperience(product),
    [product]
  );

  const handlePress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.navigate(`/viator/${product.productCode}`);
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  const isEven = index % 2 === 0;
  const smallImage =
    experience.gallery?.[0] || experience.gallery?.[1] || experience.image;

  const fromPrice = product.pricing?.summary?.fromPrice ?? experience.price;
  const currency = product.pricing?.currency ?? 'USD';
  const rating = product.reviews?.combinedAverageRating ?? experience.rating;
  const totalReviews = product.reviews?.totalReviews ?? experience.reviewCount;
  const durationM = experience.durationMinutes;

  return (
    <Pressable
      onPress={handlePress}
      className="mr-4 bg-white/0"
      style={{ width: fullWidth ? '100%' : 300 }}>
      <View className="relative mb-3 h-[180px] w-full rounded-[10px] bg-gray-100 dark:bg-dark-seconndary/50">
        <View className="h-full w-full overflow-hidden rounded-[10px]">
          <Image
            source={{ uri: experience.image }}
            className="h-full w-full rounded-[10px]"
            resizeMode="cover"
          />
        </View>

        <View
          className={`absolute h-[72px] w-[72px] overflow-hidden rounded-[10px] border-[3px] border-white bg-gray-200 dark:border-dark-bg dark:bg-dark-seconndary ${
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
        numberOfLines={2}>
        {experience.title}
      </Text>

      <View className="flex-row flex-wrap items-center px-2">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {formatDurationMinutes(durationM)}
        </Text>
        <View className="mx-2 h-3 w-[1px] bg-gray-300 dark:bg-gray-600" />
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          From {currency === 'USD' ? '$' : `${currency} `}
          {typeof fromPrice === 'number' ? fromPrice.toFixed(0) : fromPrice}
        </Text>
        <View className="mx-2 h-3 w-[1px] bg-gray-300 dark:bg-gray-600" />
        <View className="flex-row items-center">
          <Star size={14} color="#f59e0b" fill="#f59e0b" strokeWidth={0} />
          <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">
            {rating ? rating.toFixed(1) : '—'} ({totalReviews ?? 0})
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default ViatorProductCard;
