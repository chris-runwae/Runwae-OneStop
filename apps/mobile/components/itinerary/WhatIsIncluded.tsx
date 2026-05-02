import { ItineraryIncluded } from "@/constants/home.constant";
import { Building2, Car, Ticket } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

interface WhatIsIncludedProps {
  items: ItineraryIncluded[];
}

const IconMap: Record<string, React.ReactNode> = {
  hotel: <Building2 size={20} strokeWidth={1.5} color="#6b7280" />,
  car: <Car size={20} strokeWidth={1.5} color="#6b7280" />,
  ticket: <Ticket size={20} strokeWidth={1.5} color="#6b7280" />,
};

const WhatIsIncluded = ({ items }: WhatIsIncludedProps) => {
  if (!items || items.length === 0) return null;

  return (
    <View className="px-5 mt-5">
      <Text
        className="text-xl font-bold dark:text-white mb-6"
        style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
      >
        What's Included?
      </Text>

      <View className="gap-y-6">
        {items.map((item, index) => (
          <View key={index} className="flex-row items-start">
            <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-seconndary items-center justify-center mr-4 border border-gray-200 dark:border-white/10">
              {IconMap[item.icon] || (
                <Building2 size={20} strokeWidth={1.5} color="#6b7280" />
              )}
            </View>
            <View className="flex-1 pt-0.5">
              <Text className="font-bold text-base dark:text-white mb-1">
                {item.title}
              </Text>
              <Text className="text-gray-400 text-sm leading-5">
                {item.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default WhatIsIncluded;
