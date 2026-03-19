import { Trip } from "@/constants/home.constant";

import React from "react";
import { ImageBackground, Pressable, Text, View } from "react-native";
import AvatarGroup from "./AvatarGroup";

interface TripCardProps {
  trip: Trip;
  fullWidth?: boolean;
}

const TripCard = ({ trip, fullWidth = false }: TripCardProps) => {
  return (
    <Pressable
      className="rounded-2xl overflow-hidden"
      onPress={() => {}}
      style={{ width: fullWidth ? "100%" : 360, height: 210 }}
    >
      <ImageBackground
        source={{ uri: trip.image }}
        className="flex-1"
        resizeMode="cover"
      >
        <View
          className="flex-1 justify-between p-3"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          {/* Role badge */}
          <View className="flex-row justify-end">
            <View className="bg-[#000000A6] dark:bg-dark-seconndary rounded-full px-3 py-1">
              <Text className="text-xs font-semibold text-white">
                {trip.role}
              </Text>
            </View>
          </View>

          {/* Bottom info */}
          <View>
            <View className="flex-row items-end justify-between">
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-white text-lg font-bold"
                    style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
                  >
                    {trip.title}
                  </Text>

                  <AvatarGroup
                    members={trip.members}
                    extraMembers={trip.extraMembers}
                  />
                </View>
                <Text className="text-white text-sm mt-0.5">
                  📍 {trip.location}
                </Text>
              </View>
            </View>

            <Text className="text-white text-sm mt-5">
              {trip.dateRange} | {trip.duration} | {trip.items} items
            </Text>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

export default TripCard;
