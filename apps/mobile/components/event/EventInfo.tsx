import { Calendar, Clock, MapPin } from "lucide-react-native";
import React from "react";
import { Image, Text, View } from "react-native";

interface EventInfoProps {
  title: string;
  location: string;
  date: string;
  time: string;
  category: string;
}

const CATEGORY_STYLES: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  CULTURAL: {
    bg: "bg-fuchsia-100",
    border: "border-fuchsia-500",
    text: "text-fuchsia-600",
  },
  FOOD: {
    bg: "bg-indigo-100",
    border: "border-indigo-500",
    text: "text-indigo-600",
  },
  SPORT: { bg: "bg-sky-100", border: "border-sky-500", text: "text-sky-600" },
  "MUSIC FEST": {
    bg: "bg-green-100",
    border: "border-green-500",
    text: "text-green-600",
  },
};

const EventInfo = ({
  title,
  location,
  date,
  time,
  category,
}: EventInfoProps) => {
  const style = CATEGORY_STYLES[category] || {
    bg: "bg-gray-100",
    border: "border-gray-500",
    text: "text-gray-600",
  };

  return (
    <View className="px-5 pt-6">
      {/* Category Badge */}
      <View className="flex-row mb-3">
        <View
          className={`px-3 py-1 rounded-md border ${style.bg} ${style.border}`}
        >
          <Text className={`text-xs font-bold ${style.text}`}>{category}</Text>
        </View>
      </View>

      {/* Title */}
      <Text
        className="text-2xl font-bold dark:text-white mb-4"
        style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
      >
        {title}
      </Text>

      {/* Info Pills */}
      <View className="flex-row flex-wrap items-center gap-3 mb-6">
        <View className="flex-row items-center bg-gray-100 dark:bg-dark-seconndary px-3 py-2 rounded-full border border-gray-200 dark:border-white/10 gap-x-1.5">
          <MapPin size={13} color="#9ca3af" />
          <Text className="text-xs font-medium dark:text-gray-300">
            {location}
          </Text>
        </View>
        <View className="flex-row items-center bg-gray-100 dark:bg-dark-seconndary px-3 py-2 rounded-full border border-gray-200 dark:border-white/10 gap-x-1.5">
          <Calendar size={13} color="#9ca3af" />
          <Text className="text-xs font-medium dark:text-gray-300">{date}</Text>
        </View>
        <View className="flex-row items-center bg-gray-100 dark:bg-dark-seconndary px-3 py-2 rounded-full border border-gray-200 dark:border-white/10 gap-x-1.5">
          <Clock size={13} color="#9ca3af" />
          <Text className="text-xs font-medium dark:text-gray-300">{time}</Text>
        </View>
      </View>

      {/* Attendees */}
      <View className="flex-row items-center gap-x-2">
        <View className="flex-row">
          {[1, 2, 3, 4].map((i) => (
            <Image
              key={i}
              source={{ uri: `https://i.pravatar.cc/100?img=${i + 10}` }}
              className="w-8 h-8 rounded-full border border-white dark:border-gray-600 -ml-2"
              style={{ marginLeft: i === 1 ? 0 : -10 }}
            />
          ))}
          <View
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-seconndary border-2 border-white dark:border-gray-600 items-center justify-center -ml-2"
            style={{ marginLeft: -10 }}
          >
            <Text className="text-xs text-gray-400">+5k</Text>
          </View>
        </View>
        <Text className="text-gray-400 text-xs">people interested</Text>
      </View>
    </View>
  );
};

export default EventInfo;
