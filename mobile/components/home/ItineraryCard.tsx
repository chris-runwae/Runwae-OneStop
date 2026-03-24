import { Itinerary } from "@/constants/home.constant";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import React, { useState } from "react";
import {
  ImageBackground,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ItineraryCardProps {
  item: Itinerary;
  fullWidth?: boolean;
  hasBorder?: boolean;
  height?: number;
}

const ItineraryCard = ({
  item,
  fullWidth = false,
  hasBorder = true,
  height = 245,
}: ItineraryCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();
  const isNavigating = React.useRef(false);

  const handlePress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.navigate(`/itinerary/${item.id}`);
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`rounded-[24px] overflow-hidden ${
        hasBorder
          ? "border-[1.5px] border-gray-200 dark:border-dark-seconndary bg-white p-1 dark:bg-dark-seconndary/50"
          : ""
      }`}
      style={{ width: fullWidth ? "100%" : 338, height }}
    >
      <ImageBackground
        source={{ uri: item.image }}
        className="w-full h-full rounded-[20px] overflow-hidden"
        imageStyle={{ borderRadius: 20 }}
        resizeMode="cover"
      >
        <View
          className="flex-1 justify-between p-3"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <View className="flex-row justify-end">
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
              <Heart
                size={20}
                color={isFavorite ? "#FF2E92" : "#fff"}
                fill={isFavorite ? "#FF2E92" : "transparent"}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          </View>

          <View>
            <Text
              className="text-white text-3xl font-bold leading-tight mb-3"
              style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
              ellipsizeMode="tail"
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <View className="flex-row items-center gap-x-2">
              <View className="bg-[#3D3D44] px-3 py-1.5 rounded-full border border-white/30">
                <Text className="text-white text-xs font-semibold">
                  {item.activities} activities
                </Text>
              </View>
              <View className="bg-[#3D3D44] px-3 py-1.5 rounded-full border border-white/30">
                <Text className="text-white text-xs font-semibold">
                  {item.duration}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

export default ItineraryCard;
