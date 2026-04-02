import EventCard from "@/components/home/EventCard";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { EventCardSkeleton } from "@/components/ui/CardSkeletons";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SearchInput from "@/components/ui/SearchInput";
import { Event, UPCOMING_EVENTS } from "@/constants/home.constant";
import React, { useMemo, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";

const EmptyState = () => (
  <View className="flex-1 items-center justify-center w-full bg-gray-200 dark:bg-dark-seconndary/50">
    <Image
      source={require("@/assets/images/search-empty-icon.png")}
      className="w-[80px] h-[80px] mb-8"
      resizeMode="contain"
    />
    <Text
      className="font-semibold text-lg dark:text-white text-center leading-tight mb-2"
      style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
    >
      No events found
    </Text>
    <Text className="text-sm text-gray-400 text-center leading-relaxed">
      Want to try adjusting your words or use a {"\n"}different keyword.
    </Text>
  </View>
);

const EventsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return UPCOMING_EVENTS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const displayData = loading ? Array(6).fill({}) : filteredEvents;

  return (
    <AppSafeAreaView edges={["top"]}>
      <ScreenHeader hasBorder={false} title="Upcoming Events" />
      <View className="mt-5 px-[20px] pb-5 border-b-2 border-b-gray-200 dark:border-b-dark-seconndary">
        <SearchInput
          placeholder='Try searching "Coachella"'
          showFilter={false}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {!loading && filteredEvents.length === 0 ? (
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
            loading ? `skeleton-${index}` : (item as Event).id
          }
          renderItem={({ item, index }) =>
            loading ? (
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
