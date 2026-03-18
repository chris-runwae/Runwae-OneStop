import { Destination } from "@/constants/home.constant";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface DestinationCardProps {
  item: Destination;
  fullWidth?: boolean;
}

const DestinationCard = ({ item, fullWidth = false }: DestinationCardProps) => {
  const router = useRouter();
  const isNavigating = React.useRef(false);

  const handlePress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.navigate("/destination");
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  return (
    <Pressable
      onPress={handlePress}
      className={fullWidth ? "" : "mr-3"}
      style={{ width: fullWidth ? "100%" : 240 }}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-[200px] rounded-t-[16px]"
        resizeMode="cover"
      />
      <View className="mt-3">
        <Text
          className="text-black dark:text-white font-semibold text-lg leading-tight mb-1"
          numberOfLines={1}
        >
          {item.title}
        </Text>

        <Text
          className="text-gray-500 dark:text-gray-400 text-sm leading-snug"
          numberOfLines={1}
        >
          {item.location}
        </Text>
      </View>
    </Pressable>
  );
};

export default DestinationCard;
