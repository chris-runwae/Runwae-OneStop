import DetailNotFound from '@/components/experience/DetailNotFound';
import ExperienceGallery from '@/components/experience/ExperienceGallery';
import ExperienceInfo from '@/components/experience/ExperienceInfo';
import ImagePreviewModal from '@/components/experience/ImagePreviewModal';
import ReviewList from '@/components/experience/ReviewList';
import ItineraryHeader from '@/components/itinerary/ItineraryHeader';
import { mapViatorProductToExperience } from '@/utils/viator/mapViatorProductToExperience';
import { getViatorProductByCode } from '@/utils/viator/viatorProductCache';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Experience } from '@/types/content.types';

const ViatorProductDetailScreen = () => {
  const params = useLocalSearchParams<{ productCode: string }>();
  const productCode = Array.isArray(params.productCode)
    ? params.productCode[0]
    : params.productCode;

  const raw = productCode ? getViatorProductByCode(productCode) : undefined;
  const experience = useMemo<Experience | null>(
    () => (raw ? mapViatorProductToExperience(raw) : null),
    [raw]
  );

  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const allImages = useMemo(() => {
    if (!experience) return [];
    const gallery = experience.gallery || [];
    return [experience.image, ...gallery].filter(Boolean);
  }, [experience]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (allImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [allImages.length]);

  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const openPreview = (index: number) => {
    setPreviewIndex(index);
    setIsPreviewVisible(true);
  };

  if (!productCode || !raw || !experience) {
    return <DetailNotFound type="viator" />;
  }

  const bookUrl = raw.productUrl;

  return (
    <View className="flex-1">
      <ItineraryHeader
        scrollY={scrollY}
        imageUri={allImages[currentImageIndex] || experience.image}
        title={experience.title}
      />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => openPreview(currentImageIndex)}
          className="h-[300px] w-full overflow-hidden bg-gray-100">
          <Animated.Image
            key={currentImageIndex}
            entering={FadeIn.duration(1000)}
            exiting={FadeOut.duration(1000)}
            source={{ uri: allImages[currentImageIndex] || experience.image }}
            className="absolute h-full w-full"
            resizeMode="cover"
          />
        </TouchableOpacity>

        <ExperienceGallery
          images={experience.gallery || []}
          activeIndex={currentImageIndex}
          onImagePress={(index) => openPreview(index)}
        />

        <ExperienceInfo
          title={experience.title}
          price={experience.price}
          description={experience.description}
          category={experience.category}
          location={experience.location}
          durationMinutes={experience.durationMinutes}
          cost={experience.cost}
          currency={experience.currency}
        />

        {bookUrl ? (
          <View className="px-5 pb-6">
            <TouchableOpacity
              onPress={() => Linking.openURL(bookUrl)}
              className="items-center rounded-[6px] bg-primary py-3.5">
              <Text className="text-base font-semibold text-white">
                View on Viator
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View className="mt-2 h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        <ReviewList
          reviews={experience.reviews || []}
          totalReviews={experience.reviewCount || 0}
        />
      </Animated.ScrollView>

      <ImagePreviewModal
        images={allImages}
        visible={isPreviewVisible}
        initialIndex={previewIndex}
        onClose={() => setIsPreviewVisible(false)}
      />
    </View>
  );
};

export default ViatorProductDetailScreen;
