import React, { memo, useMemo } from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ExperienceGalleryProps {
  images: string[];
  activeIndex?: number;
  onImagePress?: (index: number) => void;
}

const ExperienceGallery = ({
  images,
  activeIndex = -1,
  onImagePress,
}: ExperienceGalleryProps) => {
  if (!images || images.length === 0) return null;

  const { displayImages, remainingCount } = useMemo(() => {
    return {
      displayImages: images.slice(0, 4),
      remainingCount: images.length - 4,
    };
  }, [images]);

  return (
    <View className="flex-row gap-x-2 mt-2">
      {displayImages.map((uri, index) => {
        const isLast = index === 3;
        const hasMore = remainingCount > 0;
        const Container = isLast && hasMore ? TouchableOpacity : View;

        return (
          <Container
            key={`${uri}-${index}`}
            onPress={
              isLast && hasMore ? () => onImagePress?.(index + 1) : undefined
            }
            activeOpacity={isLast && hasMore ? 0.8 : 1}
            className="flex-1 h-[95px] overflow-hidden relative"
            accessibilityRole={isLast && hasMore ? "button" : "image"}
            accessibilityLabel={
              isLast && hasMore
                ? `View ${remainingCount} more images`
                : `Gallery image ${index + 1}`
            }
          >
            {isLast && hasMore ? (
              <ImageBackground
                source={{ uri }}
                className="w-full h-full items-center justify-center"
                resizeMode="cover"
              >
                <View
                  className="absolute inset-0 bg-black/30"
                  pointerEvents="none"
                />
                {index === activeIndex - 1 && (
                  <View
                    className="absolute inset-0 bg-primary/30"
                    pointerEvents="none"
                  />
                )}
                <Text className="text-white text-base">+{remainingCount}</Text>
              </ImageBackground>
            ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onImagePress?.(index + 1)}
                  className="w-full h-full"
                >
                  <Image
                    source={{ uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {index === activeIndex - 1 && (
                    <View
                      className="absolute inset-0 bg-primary/30"
                      pointerEvents="none"
                    />
                  )}
                </TouchableOpacity>
            )}
          </Container>
        );
      })}
    </View>
  );
};

export default memo(ExperienceGallery);
