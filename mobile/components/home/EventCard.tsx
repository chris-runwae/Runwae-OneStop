import { Event } from "@/constants/home.constant";
import { router } from "expo-router";
import { MapPin } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface EventCardProps {
  event: Event;
  isLast?: boolean;
}

const EventCard = ({ event, isLast }: EventCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/events/${event.id}` as any)}
      className={`flex-row items-center py-3 ${
        !isLast
          ? "border-b border-b-gray-200 dark:border-b-dark-seconndary"
          : ""
      }`}
    >
      <Image
        source={{ uri: event.image }}
        className="w-[80px] h-[80px] rounded-l-[12px]"
        resizeMode="cover"
      />

      {/* Event Info */}
      <View className="flex-1 ml-4 justify-center">
        <View className="flex-row justify-between items-start">
          <Text
            className="text-lg font-bold text-black dark:text-white flex-1"
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
          >
            {event.title}
          </Text>
          <View
            className={`px-2 py-0.5 rounded-md border ${
              event.category === "CULTURAL"
                ? "bg-fuchsia-100 border-fuchsia-500"
                : event.category === "FOOD"
                  ? "bg-indigo-100 border-indigo-500"
                  : event.category === "SPORT"
                    ? "bg-sky-100 border-sky-500"
                    : event.category === "MUSIC FEST"
                      ? "bg-green-100 border-green-500"
                      : "bg-gray-100 border-gray-500"
            }`}
          >
            <Text
              className={`text-[10px] font-bold ${
                event.category === "CULTURAL"
                  ? "text-fuchsia-600"
                  : event.category === "FOOD"
                    ? "text-indigo-600"
                    : event.category === "SPORT"
                      ? "text-sky-600"
                      : event.category === "MUSIC FEST"
                        ? "text-green-600"
                        : "text-gray-600"
              }`}
            >
              {event.category}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <MapPin size={14} color="#9ca3af" />
          <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1">
            {event.location}
          </Text>
        </View>

        <View className="flex-row items-center mt-3">
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {event.date}
          </Text>
          <Text className="mx-2 text-gray-300">|</Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {event.time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;

