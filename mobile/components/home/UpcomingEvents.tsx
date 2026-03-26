import { EventCardSkeleton } from "@/components/ui/CardSkeletons";
import SectionHeader from "@/components/ui/SectionHeader";
import { Event } from "@/constants/home.constant";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, View } from "react-native";
import EventCard from "./EventCard";

interface UpcomingEventsProps {
  data: Event[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  showSubtitle?: boolean;
}

const UpcomingEvents = ({
  data,
  title = "Upcoming Events",
  subtitle = "Find events that match your vibe",
  loading = false,
  showSubtitle = true,
}: UpcomingEventsProps) => {
  const router = useRouter();
  const displayData = loading ? (Array(5).fill({}) as Event[]) : data;

  return (
    <View className="mt-5 border-b-[3px] border-b-gray-200 dark:border-b-dark-seconndary pb-5">
      <SectionHeader 
        title={title} 
        subtitle={showSubtitle ? subtitle : undefined} 
        onPress={() => router.push("/events" as any)} 
      />

      <FlatList
        data={displayData}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          marginTop: 16,
        }}
        keyExtractor={(item, index) =>
          loading ? `skeleton-${index}` : item.id
        }
        renderItem={({ item, index }) =>
          loading ? (
            <EventCardSkeleton index={index} />
          ) : (
            <EventCard event={item} index={index} />
          )
        }
      />
    </View>
  );
};

export default UpcomingEvents;
