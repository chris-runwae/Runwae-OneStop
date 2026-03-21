import ItineraryCard from "@/components/home/ItineraryCard";
import { ItineraryCardSkeleton } from "@/components/ui/CardSkeletons";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SearchInput from "@/components/ui/SearchInput";
import { ITINERARIES_FOR_YOU } from "@/constants/home.constant";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

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
      Sorry, we couldn’t seem to find a match
    </Text>
    <Text className="text-sm text-gray-400 text-center leading-relaxed">
      Want to try adjusting your words or use a {"\n"}different keyword.
    </Text>
  </View>
);

const Itineraries = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredItineraries = useMemo(() => {
    return ITINERARIES_FOR_YOU.filter(
      (itinerary) =>
        itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itinerary.activities.toString().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const displayData = loading ? Array(5).fill({}) : filteredItineraries;

  return (
    <AppSafeAreaView edges={["top"]}>
      <ScreenHeader hasBorder={false} title="Itinerary" />
      <View className="mt-5 px-[20px] pb-5 border-b-2 border-b-gray-200 dark:border-b-dark-seconndary">
        <SearchInput
          placeholder="Try searching “Day in Lagos”"
          showFilter={false}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {!loading && filteredItineraries.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={displayData}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
          keyExtractor={(item, index) => (loading ? `skeleton-${index}` : item.id)}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) =>
            loading ? (
              <ItineraryCardSkeleton fullWidth={true} height={371} />
            ) : (
            <ItineraryCard
              hasBorder={false}
              height={371}
              item={item}
              fullWidth={true}
            />
            )
          }
          ListEmptyComponent={<View />}
        />
      )}
    </AppSafeAreaView>
  );
};

export default Itineraries;
