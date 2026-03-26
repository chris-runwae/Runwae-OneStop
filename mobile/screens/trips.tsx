import TripCard from "@/components/home/TripCard";
import EmptyTripsState from "@/components/trips/EmptyTripsState";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { TripCardSkeleton } from "@/components/ui/CardSkeletons";
import NotificationBell from "@/components/ui/NotificationBell";
import { UPCOMING_TRIPS } from "@/constants/home.constant";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

const MAIN_TABS = ["Active", "Saved", "Past"];
const ROLE_FILTERS = [
  { id: "all", name: "All", emoji: "" },
  { id: "Leader", name: "Leader", emoji: "👤" },
  { id: "Co-Leader", name: "Co-Leader", emoji: "👥" },
  { id: "Member", name: "Member", emoji: "🥳" },
];

const Trips = () => {
  const [activeMainTab, setActiveMainTab] = useState("Active");
  const [activeRoleFilter, setActiveRoleFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [activeMainTab]);


  const filteredTrips = useMemo(() => {
    if (activeRoleFilter === "all") return UPCOMING_TRIPS;
    return UPCOMING_TRIPS.filter((trip) => trip.role === activeRoleFilter);
  }, [activeRoleFilter]);

  return (
    <AppSafeAreaView edges={["top"]}>
      <View className="pt-5 border-b border-gray-100 dark:border-dark-seconndary">
        <View className="flex-row items-center justify-between px-5 mb-6">
          <Text
            className="text-3xl font-bold dark:text-white"
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
          >
            Trips
          </Text>
          <NotificationBell />
        </View>

        <View className="flex-row px-5 gap-x-2 pb-4">
          {MAIN_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveMainTab(tab)}
              className={`px-5 py-2.5 rounded-full ${
                activeMainTab === tab
                  ? "bg-primary"
                  : "bg-gray-100 dark:bg-dark-seconndary"
              }`}
            >
              <Text
                className={`text-sm ${
                  activeMainTab === tab
                    ? "text-white"
                    : "text-gray-400 dark:text-white"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeMainTab === "Active" ? (
        <>
          <View className="pt-4 pb-5">
            <FlatList
              data={ROLE_FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
              renderItem={({ item: filter }) => (
                <TouchableOpacity
                  onPress={() => setActiveRoleFilter(filter.id)}
                  className={`flex-row items-center px-4 py-2 rounded-full border ${
                    activeRoleFilter === filter.id
                      ? "bg-primary border-primary"
                      : "bg-white dark:bg-dark-seconndary border-gray-200 dark:border-white/10"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      activeRoleFilter === filter.id
                        ? "text-white"
                        : "text-gray-600 dark:text-white"
                    }`}
                  >
                    {filter.emoji ? `${filter.emoji} ` : ""}
                    {filter.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {isLoading ? (
            <View className="px-5 gap-y-4">
              {[1, 2, 3].map((i) => (
                <TripCardSkeleton key={i} fullWidth />
              ))}
            </View>
          ) : filteredTrips.length === 0 ? (
            <EmptyTripsState
              title={
                activeRoleFilter === "all"
                  ? "No Trips Booked Yet"
                  : `No ${
                      ROLE_FILTERS.find((f) => f.id === activeRoleFilter)?.name
                    } Trips Yet`
              }
              description={
                activeRoleFilter === "all"
                  ? "Tap the + below to start planning your\nnext adventure!"
                  : `You don't have any trips as a ${
                      ROLE_FILTERS.find((f) => f.id === activeRoleFilter)?.name
                    }.`
              }
            />
          ) : (
            <FlatList
              data={filteredTrips}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                padding: 20,
                paddingTop: 0,
                paddingBottom: 100,
                flexGrow: 1,
              }}
              ItemSeparatorComponent={() => <View className="h-4" />}
              renderItem={({ item }) => <TripCard trip={item} fullWidth />}
              ListEmptyComponent={<View />}
            />
          )}
        </>
      ) : (
        <EmptyTripsState
          title={`No ${activeMainTab} Trips Yet`}
          description={
            activeMainTab === "Saved"
              ? "Trips you save will appear here for easy planning."
              : "Completed trips will show up here as your history."
          }
        />
      )}
    </AppSafeAreaView>
  );
};

export default Trips;
