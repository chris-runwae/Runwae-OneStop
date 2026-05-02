import { DailyItinerary as DailyItineraryType } from "@/constants/home.constant";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ActivityItem from "./ActivityItem";

interface DailyItineraryProps {
  itinerary: DailyItineraryType[];
}

const DailyItinerary = ({ itinerary }: DailyItineraryProps) => {
  const [selectedDay, setSelectedDay] = useState(1);

  if (!itinerary || itinerary.length === 0) return null;

  const currentDayData = itinerary.find((d) => d.day === selectedDay);

  return (
    <View className="mt-5 mb-5">
      <Text
        className="px-5 text-xl font-bold dark:text-white mb-6"
        style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
      >
        Daily Itinerary
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        className="mb-5"
      >
        {itinerary.map((item) => (
          <TouchableOpacity
            key={item.day}
            onPress={() => setSelectedDay(item.day)}
            className={`mr-3 px-3 py-2 rounded-full border ${
              selectedDay === item.day
                ? "bg-primary/10 border-primary"
                : "bg-white dark:bg-dark-seconndary border-gray-200 dark:border-white/10"
            }`}
          >
            <Text
              className={`text-sm ${
                selectedDay === item.day ? "text-[#FF2E92]" : "text-gray-500"
              }`}
            >
              Day {item.day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="px-5">
        {currentDayData?.activities.map((activity, index) => (
          <ActivityItem
            key={index}
            title={activity.title}
            description={activity.description}
          />
        ))}
      </View>
    </View>
  );
};

export default DailyItinerary;
