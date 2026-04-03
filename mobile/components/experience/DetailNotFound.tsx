import React from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";

interface DetailNotFoundProps {
  type: "itinerary" | "experience" | "destination";
}

const DetailNotFound = ({ type }: DetailNotFoundProps) => {
  const router = useRouter();
  const label =
    type === "itinerary"
      ? "Itinerary"
      : type === "experience"
      ? "Experience"
      : "Destination";

  return (
    <View className="flex-1 bg-white dark:bg-dark items-center justify-center px-8">
      <Image
        source={require("@/assets/images/search-empty-icon.png")}
        className="w-32 h-32 mb-8 opacity-60"
        resizeMode="contain"
      />
      <Text
        className="text-2xl font-bold dark:text-white text-center mb-2"
        style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
      >
        {label} not found
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-center text-base leading-6 mb-10">
        We couldn't find the {type} you're looking for. It might have been
        removed or the link is incorrect.
      </Text>
      <TouchableOpacity
        onPress={() => router.replace("/explore")}
        className="bg-[#FF2E92] px-10 py-4 rounded-full shadow-lg"
        style={{ elevation: 5 }}
      >
        <Text className="text-white font-bold text-lg">
          Return to Explore
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DetailNotFound;
