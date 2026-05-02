import { AddOnKnow } from "@/constants/home.constant";
import {
  Activity,
  Briefcase,
  FileText,
  Info,
  LucideIcon,
  Music,
  Users,
  Utensils,
} from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

const ICON_MAP: Record<string, LucideIcon> = {
  users: Users,
  activity: Activity,
  utensils: Utensils,
  music: Music,
  briefcase: Briefcase,
  "file-text": FileText,
};

interface WhatToKnowProps {
  items: AddOnKnow[];
}

const WhatToKnow = ({ items }: WhatToKnowProps) => {
  if (!items || items.length === 0) return null;

  return (
    <View className="px-5 mt-5">
      <Text
        className="text-black dark:text-white text-xl font-bold mb-4"
        style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
      >
        What to Know
      </Text>
      <View className="gap-y-6">
        {items.map((item, index) => {
          const IconComponent = ICON_MAP[item.icon] || Info;
          return (
            <View key={index} className="flex-row gap-x-2">
              <View className="w-10 h-10 items-center justify-center">
                <IconComponent size={20} color="#6B7280" strokeWidth={1.7} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-black dark:text-white text-lg font-bold mb-1"
                  style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
                >
                  {item.title}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm leading-snug">
                  {item.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default WhatToKnow;
