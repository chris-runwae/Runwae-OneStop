import { TripCardSkeleton } from "@/components/ui/CardSkeletons";
import SectionHeader from "@/components/ui/SectionHeader";
import { Trip } from "@/constants/home.constant";
import React from "react";
import { FlatList, Image, Text, View } from "react-native";
import TripCard from "./TripCard";

interface UpcomingTripsProps {
  trips: Trip[];
  loading?: boolean;
}

const UpcomingTrips = ({ trips, loading = false }: UpcomingTripsProps) => {
  const displayData = loading ? Array(5).fill({}) : trips;

  return (
    <View className="mt-5 border-b-[3px] border-b-gray-200 dark:border-b-dark-seconndary pb-5">
      <SectionHeader title="Upcoming Trips" onPress={() => {}} />

      <FlatList
        data={displayData}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          marginTop: 16,
          paddingHorizontal: 20,
        }}
        keyExtractor={(item, index) => (loading ? `skeleton-${index}` : item.id)}
        ItemSeparatorComponent={() => <View className="w-3" />}
        renderItem={({ item }) =>
          loading ? <TripCardSkeleton /> : <TripCard trip={item} />
        }

        ListEmptyComponent={
          <View className="flex items-center justify-center w-full">
            <Image
              source={require("@/assets/images/trip-empty-state.png")}
              className="h-[44px] w-[44px] mb-5"
              resizeMode="contain"
            />
            <Text
              className="font-semibold text-lg dark:text-white"
              style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            >
              No trips planned yet
            </Text>
            <Text className="text-sm text-gray-400 mt-1 dark:text-gray-500 text-center">
              No upcoming trips. Let's start exploring and plan{"\n"} your first
              adventure!
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default UpcomingTrips;
