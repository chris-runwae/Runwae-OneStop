import { BlurView } from "expo-blur";
import { useRouter, useSegments } from "expo-router";
import { ChevronLeft, Heart, Upload } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ShareModal from "./ShareModal";

interface ItineraryHeaderProps {
  scrollY: SharedValue<number>;
  imageUri: string;
  title: string;
}

const ItineraryHeader = ({
  scrollY,
  imageUri,
  title,
}: ItineraryHeaderProps) => {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const isExperience = segments[0] === "experience";

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [100, 200], [0, 1], "clamp");
    return {
      opacity,
    };
  });

  return (
    <>
      <View
        className="absolute top-0 left-0 right-0 z-50 flex-row justify-between items-center px-5 pb-3"
        style={{ paddingTop: insets.top + 10, height: insets.top + 60 }}
      >
        <Animated.View
          className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden bg-gray-100"
          style={headerAnimatedStyle}
        >
          <Animated.Image
            key={imageUri}
            entering={FadeIn.duration(1000)}
            exiting={FadeOut.duration(1000)}
            source={{ uri: imageUri }}
            className="absolute top-0 left-0 right-0 bottom-0"
            resizeMode="cover"
          />
          <BlurView intensity={10} tint="light" className="flex-1" />
        </Animated.View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
        >
          <ChevronLeft size={20} strokeWidth={1.5} color="#000" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-x-3">
          <TouchableOpacity
            onPress={() => setIsShareModalVisible(true)}
            className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
          >
            <Upload size={17} strokeWidth={1.5} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
          >
            <Heart
              size={17}
              strokeWidth={1.5}
              color={isFavorite ? "#FF2E92" : "#000"}
              fill={isFavorite ? "#FF2E92" : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ShareModal
        isVisible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
        title={title}
        showImage={!isExperience}
        imageUri={imageUri}
      />
    </>
  );
};

export default ItineraryHeader;
