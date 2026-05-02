import { AddOnIncluded } from "@/constants/home.constant";
import { CircleCheckBig } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

interface ExperienceIncludedProps {
  items: AddOnIncluded[];
}

const ExperienceIncluded = ({ items }: ExperienceIncludedProps) => {
  if (!items || items.length === 0) return null;

  return (
    <View className="px-5 mt-5">
      <Text
        className="text-black dark:text-white text-xl font-bold mb-4"
        style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
      >
        What's Included?
      </Text>
      <View className="gap-y-4">
        {items.map((item, index) => (
          <View key={index} className="flex-row items-center gap-x-4">
            <CircleCheckBig size={18} color="#16a34a" strokeWidth={1.5} />
            <Text className="text-black dark:text-white text-sm font-medium">
              {item.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ExperienceIncluded;
