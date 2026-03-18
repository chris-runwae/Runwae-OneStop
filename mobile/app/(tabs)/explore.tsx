import AddOnsForYou from "@/components/home/AddOnsForYou";
import DestinationsForYou from "@/components/home/DestinationsForYou";
import ExploreCategories from "@/components/home/ExploreCategories";
import ItineraryForYou from "@/components/home/IteneryForYou";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import CustomModal from "@/components/ui/CustomModal";
import MainTabHeader from "@/components/ui/MainTabHeader";
import SearchInput from "@/components/ui/SearchInput";
import {
  DESTINATION_HIGHLIGHTS,
  EXPERIENCE_HIGHLIGHTS,
  EXPLORE_CATEGORIES,
  FEATURED_ITINERARIES,
  UPCOMING_EVENTS,
} from "@/constants/home.constant";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const ExploreScreen = () => {
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("$50 - $200");
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleApplyFilters = () => {

    console.log("Applying filters:", { selectedCategory, selectedPrice });
    setIsFilterModalVisible(false);
  };

  return (
    <AppSafeAreaView>
      <MainTabHeader title="Explore" />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mt-4 px-[20px]">
          <SearchInput
            placeholder="Search trips, hotels, experiences..."
            onFilterPress={() => setIsFilterModalVisible(true)}
          />
        </View>
        <ExploreCategories
          categories={EXPLORE_CATEGORIES}
          selectedCategory={selectedCategory}
          onCategoryPress={(cat) => setSelectedCategory(cat)}
        />
        <ItineraryForYou
          data={FEATURED_ITINERARIES}
          title="Featured Trip Itineraries"
          subtitle="Recommended by Runwae"
          loading={loading}
        />
        <UpcomingEvents data={UPCOMING_EVENTS} loading={loading} />
        <AddOnsForYou
          data={EXPERIENCE_HIGHLIGHTS}
          title="Experience Highlights"
          subtitle="Top picks for you"
          loading={loading}
        />
        <DestinationsForYou
          data={DESTINATION_HIGHLIGHTS}
          title="Popular Destinations"
          subtitle="Places that everyone else is crazy about"
          loading={loading}
        />

      </ScrollView>

      <CustomModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        title="Filter Options"
      >
        <View className="py-2 flex-col gap-y-6">
          {/* Category Filter */}
          <View>
            <Text className="font-semibold text-lg text-black dark:text-white mb-3">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {["All", "Trips", "Hotels", "Experiences"].map((cat, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full border ${
                    cat === selectedCategory
                      ? "bg-primary border-primary"
                      : "bg-transparent border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <Text
                    className={`${
                      cat === selectedCategory
                        ? "text-white"
                        : "text-black dark:text-white text-sm"
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View>
            <Text className="font-semibold text-lg text-black dark:text-white mb-3">
              Price Range
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {["$0 - $50", "$50 - $200", "$200 - $500", "$500+"].map(
                (price, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedPrice(price)}
                    className={`px-4 py-2 rounded-full border ${
                      price === selectedPrice
                        ? "bg-primary border-primary"
                        : "bg-transparent border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <Text
                      className={`${
                        price === selectedPrice
                          ? "text-white"
                          : "text-black dark:text-white text-sm"
                      }`}
                    >
                      {price}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          </View>

          {/* Apply Button */}
          <TouchableOpacity
            className="w-full bg-primary py-3.5 rounded-[6px] items-center mt-4"
            onPress={handleApplyFilters}
          >
            <Text className="text-white font-semibold text-base">
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </CustomModal>
    </AppSafeAreaView>
  );
};

export default ExploreScreen;
