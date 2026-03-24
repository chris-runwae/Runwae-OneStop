import { EventCardSkeleton } from "@/components/ui/CardSkeletons";
import SectionHeader from "@/components/ui/SectionHeader";
import { Event } from "@/constants/home.constant";
import { router } from "expo-router";
import React from "react";
import { Dimensions, FlatList, View } from "react-native";
import EventCard from "./EventCard";

const { width } = Dimensions.get("window");

interface UpcomingEventsProps {
  data: Event[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

const UpcomingEvents = ({
  data,
  title = "Upcoming Events",
  subtitle = "Find events that match your vibe",
  loading = false,
}: UpcomingEventsProps) => {
  const columns = [];
  if (loading) {
    columns.push([{}, {}, {}]);
    columns.push([{}, {}, {}]);
  } else {
    for (let i = 0; i < data.length; i += 3) {
      columns.push(data.slice(i, i + 3));
    }
  }

  return (
    <View className="mt-5 border-b-[3px] border-b-gray-200 dark:border-b-dark-seconndary pb-2">
      <SectionHeader title={title} subtitle={subtitle} onPress={() => router.push("/events" as any)} />

      <FlatList
        data={columns}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={width}
        contentContainerStyle={{
          paddingHorizontal: 20,
          marginTop: 16,
        }}
        keyExtractor={(_, index) => `col-${index}`}
        renderItem={({ item: column }) => (
          <View style={{ width: width - 40 }} className="mr-5">
            {column.map((event, index) =>
              loading ? (
                <EventCardSkeleton key={`skeleton-${index}`} />
              ) : (
                <EventCard
                  key={(event as Event).id}
                  event={event as Event}
                  isLast={index === column.length - 1}
                />
              ),
            )}
          </View>
        )}
      />
    </View>
  );
};

export default UpcomingEvents;
