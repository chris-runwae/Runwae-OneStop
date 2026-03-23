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
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const ExploreScreen = () => {
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [selectedTopCategory, setSelectedTopCategory] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("$50 - $200");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleApplyFilters = () => {
    console.log("Applying filters:", { selectedTopCategory, selectedPrice });
    setIsFilterModalVisible(false);
  };

  // Helper function for text search
  const matchesSearch = (text: string, query: string) => {
    if (!query) return true;
    return text.toLowerCase().includes(query.toLowerCase());
  };

  // Helper for sub-category matching
  const matchesSubCategory = (itemCategory: string, selected: string) => {
    if (selected === "All") return true;
    return itemCategory === selected;
  };

  const filteredItineraries = useMemo(() => {
    if (selectedTopCategory !== "All" && selectedTopCategory !== "Trips") return [];
    return FEATURED_ITINERARIES.filter(
      (item) =>
        matchesSearch(item.title + item.location, searchQuery) &&
        matchesSubCategory(item.category, selectedSubCategory)
    );
  }, [searchQuery, selectedSubCategory, selectedTopCategory]);

  const filteredEvents = useMemo(() => {
    if (selectedTopCategory !== "All" && selectedTopCategory !== "Experiences") return [];
    return UPCOMING_EVENTS.filter(
      (item) =>
        matchesSearch(item.title + item.location, searchQuery) &&
        matchesSubCategory(item.category, selectedSubCategory)
    );
  }, [searchQuery, selectedSubCategory, selectedTopCategory]);

  const filteredExperiences = useMemo(() => {
    if (selectedTopCategory !== "All" && selectedTopCategory !== "Experiences") return [];
    
    // Parse price range from string e.g., "$50 - $200"
    const getPriceBounds = (range: string) => {
      if (range === "$500+") return [500, Infinity];
      const numbers = range.match(/\d+/g)?.map(Number) || [0, Infinity];
      return [numbers[0], numbers[1] || Infinity];
    };
    
    const [minPrice, maxPrice] = getPriceBounds(selectedPrice);

    return EXPERIENCE_HIGHLIGHTS.filter(
      (item) =>
        matchesSearch(item.title, searchQuery) &&
        matchesSubCategory(item.category, selectedSubCategory) &&
        item.price >= minPrice && item.price <= maxPrice
    );
  }, [searchQuery, selectedSubCategory, selectedTopCategory, selectedPrice]);

  const filteredDestinations = useMemo(() => {
    if (selectedTopCategory !== "All" && selectedTopCategory !== "Trips") return [];
    return DESTINATION_HIGHLIGHTS.filter(
      (item) => matchesSearch(item.title + item.location, searchQuery)
    );
  }, [searchQuery, selectedTopCategory]);

  return (
    <AppSafeAreaView>
      <MainTabHeader title="Explore" />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mt-4 px-[20px]">
          <SearchInput
            placeholder="Search trips, hotels, experiences..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFilterPress={() => setIsFilterModalVisible(true)}
          />
        </View>
        <ExploreCategories
          categories={EXPLORE_CATEGORIES}
          selectedCategory={selectedSubCategory}
          onCategoryPress={(cat) => setSelectedSubCategory(cat)}
          showClear={
            searchQuery !== "" || 
            selectedSubCategory !== "All" || 
            selectedTopCategory !== "All" || 
            selectedPrice !== "$50 - $200"
          }
          onClear={() => {
            setSearchQuery("");
            setSelectedSubCategory("All");
            setSelectedTopCategory("All");
            setSelectedPrice("$50 - $200");
          }}
        />
        
        {filteredItineraries.length > 0 && (
          <ItineraryForYou
            data={filteredItineraries}
            title="Featured Trip Itineraries"
            subtitle="Recommended by Runwae"
            loading={loading}
          />
        )}

        {filteredEvents.length > 0 && (
          <UpcomingEvents data={filteredEvents} loading={loading} />
        )}

        {filteredExperiences.length > 0 && (
          <AddOnsForYou
            data={filteredExperiences}
            title="Experience Highlights"
            subtitle="Top picks for you"
            loading={loading}
          />
        )}

        {filteredDestinations.length > 0 && (
          <DestinationsForYou
            data={filteredDestinations}
            title="Popular Destinations"
            subtitle="Places that everyone else is crazy about"
            loading={loading}
          />
        )}

        {filteredItineraries.length === 0 && 
         filteredEvents.length === 0 && 
         filteredExperiences.length === 0 && 
         filteredDestinations.length === 0 && (
          <View className="items-center justify-center py-10 px-5">
            <Text className="text-gray-400 text-center text-lg font-medium">
              No results found for "{searchQuery}"
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery("");
                setSelectedSubCategory("All");
                setSelectedTopCategory("All");
              }}
              className="mt-4"
            >
              <Text className="text-primary font-semibold">Clear all filters</Text>
            </TouchableOpacity>
          </View>
        )}

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
                  onPress={() => setSelectedTopCategory(cat)}
                  className={`px-4 py-2 rounded-full border ${
                    cat === selectedTopCategory
                      ? "bg-primary border-primary"
                      : "bg-transparent border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <Text
                    className={`${
                      cat === selectedTopCategory
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
