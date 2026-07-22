import { Itinerary } from "@/constants/home.constant";
import { Link } from "expo-router";
import { ImageBackground } from 'expo-image'
import { Heart, ArrowUpRightIcon } from "lucide-react-native";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
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
}: ItineraryCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);


  return (
    <View className={`rounded-[24px] overflow-hidden`}>
    <Link href={`/itinerary/${item.id}`} asChild>
      <Link.AppleZoom>
        <Pressable>
          <ImageBackground
            source={{ uri: item.image }}
            imageStyle={{ borderRadius: 20 }}
            style={{ width: 320, height: 240, overflow: 'hidden'  }}
            contentFit="cover"
          >
            <View
              className="flex-1 justify-between p-3"
              style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            >
            <View style={styles.heartContainer}>
              <Pressable onPress={() => setIsFavorite(!isFavorite)}>
                <ArrowUpRightIcon //replace with Heart functionality
                  size={24}
                  color={isFavorite ? "#FF2E92" : "#fff"}
                  fill={isFavorite ? "#FF2E92" : "transparent"}
                  strokeWidth={1.5}
                />
              </Pressable>
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
      </Link.AppleZoom>
    </Link>
    </View>
  );
};

export default ItineraryCard;

const styles = StyleSheet.create({
  heartContainer: {
    alignSelf: 'flex-end',
    paddingTop: 6,
    paddingRight: 6
  }
})
