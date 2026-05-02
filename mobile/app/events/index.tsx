import EventCard from "@/components/home/EventCard";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { EventCardSkeleton } from "@/components/ui/CardSkeletons";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SearchInput from "@/components/ui/SearchInput";
import { Event } from "@/types/content.types";
import { getEvents, searchEvents } from "@/utils/supabase/events.service";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";

const EmptyState = () => (
  <View className="flex-1 items-center justify-center w-full bg-transparent px-10">
    <Image
      source={require("@/assets/images/search-empty-icon.png")}
      className="w-[120px] h-[120px] mb-6 opacity-60"
      resizeMode="contain"
    />
    <Text
      className="font-bold text-xl dark:text-white text-center leading-tight mb-2"
      style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
    >
      No events found
    </Text>
    <Text className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
      Try adjusting your search terms or use a different keyword to find what you're looking for.
    </Text>
  </View>
);

const EventsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = query.trim() 
        ? await searchEvents(query) 
        : await getEvents();
      setEvents(data);
    } catch (err) {
      console.error("EventsScreen: Error fetching events:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch events"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchEvents("");
  }, [fetchEvents]);

  useEffect(() => {
    if (!searchQuery) {
      fetchEvents("");
      return;
    }

    const timer = setTimeout(() => {
      fetchEvents(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, fetchEvents]);

  const displayData = loading && events.length === 0 ? Array(6).fill({}) : events;

  return (
    <AppSafeAreaView edges={["top"]}>
      <ScreenHeader hasBorder={false} title="Upcoming Events" />
      <View className="mt-5 px-[20px] pb-5 border-b-2 border-b-gray-200 dark:border-b-dark-seconndary">
        <SearchInput
          placeholder='Try searching "Safari" or "Tanzania"'
          showFilter={false}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {!loading && events.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={displayData}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={{ gap: 16, marginBottom: 20 }}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 20,
            paddingTop: 10,
          }}
          keyExtractor={(item, index) =>
            loading && events.length === 0 ? `skeleton-${index}` : (item as Event).id
          }
          renderItem={({ item, index }) =>
            loading && events.length === 0 ? (
              <View className="flex-1" style={{ maxWidth: '48%' }}>
                <EventCardSkeleton index={index} fullWidth />
              </View>
            ) : (
              <View className="flex-1" style={{ maxWidth: '48%' }}>
                <EventCard
                  event={item as Event}
                  index={index}
                  fullWidth
                  inlineEmoji
                />
              </View>
            )
          }
          ListEmptyComponent={<View />}
        />
      )}
    </AppSafeAreaView>
  );
};

export default EventsScreen;

