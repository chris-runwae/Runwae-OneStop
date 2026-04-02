import DetailNotFound from "@/components/experience/DetailNotFound";
import ExperienceGallery from "@/components/experience/ExperienceGallery";
import ExperienceIncluded from "@/components/experience/ExperienceIncluded";
import ExperienceInfo from "@/components/experience/ExperienceInfo";
import ExperienceItinerary from "@/components/experience/ExperienceItinerary";
import ImagePreviewModal from "@/components/experience/ImagePreviewModal";
import ReviewList from "@/components/experience/ReviewList";
import WhatToKnow from "@/components/experience/WhatToKnow";
import ItineraryHeader from "@/components/itinerary/ItineraryHeader";
import { useDetailItem } from "@/hooks/use-detail-item";
import React, { useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ExperienceDetailScreen = () => {
  const { id, item: experience, loading } = useDetailItem("experience") as {
    id: string;
    item: any;
    loading: boolean;
  };
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

  if (!loading && !experience) {
    return <DetailNotFound type="experience" />;
  }

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
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => openPreview(currentImageIndex)}
          className="w-full h-[300px] bg-gray-100 overflow-hidden"
        >
          <Animated.Image
            key={currentImageIndex}
            entering={FadeIn.duration(1000)}
            exiting={FadeOut.duration(1000)}
            source={{ uri: allImages[currentImageIndex] || experience.image }}
            className="w-full h-full absolute"
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
        />
        <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20 mt-8" />

        <ExperienceItinerary items={experience.itinerary || []} />
        <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20 mt-8" />

        <ExperienceIncluded items={experience.included || []} />
        <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20 mt-8" />

        <WhatToKnow items={experience.whatToKnow || []} />
        <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20 mt-8" />

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

export default ExperienceDetailScreen;
