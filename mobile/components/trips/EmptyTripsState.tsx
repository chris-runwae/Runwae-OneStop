import React from "react";
import { Image, Text, View } from "react-native";

interface EmptyTripsStateProps {
  title?: string;
  description?: string;
}

const EmptyTripsState = ({
  title = "No Trips Booked Yet",
  description = "Tap the + below to start planning your\nnext adventure!",
}: EmptyTripsStateProps) => {
  return (
    <View className="flex-1 bg-gray-100 dark:bg-dark-seconndary/40 items-center justify-center">
      <Image
        source={require("@/assets/images/trip-empty-state-2.png")}
        className="w-[80px] h-[80px] mb-6"
        resizeMode="contain"
      />
      <Text
        className="text-xl font-bold dark:text-white text-center mb-2"
        style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
      >
        {title}
      </Text>
      <Text className="text-sm text-gray-400 dark:text-gray-500 text-center leading-5">
        {description}
      </Text>
    </View>
  );
};

export default EmptyTripsState;
