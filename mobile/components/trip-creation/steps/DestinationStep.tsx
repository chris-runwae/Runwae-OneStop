import SkeletonBox from "@/components/ui/SkeletonBox";
import { LiteAPIPlace } from "@/types/liteapi.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface DestinationStepProps {
  width: number;
  dark: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setDestination: (destination: string) => void;
  debouncedSearch: (query: string, delay: number) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  places: LiteAPIPlace[];
  loading: boolean;
  errorMessage: string | null;
}

export const DestinationStep: React.FC<DestinationStepProps> = ({
  width,
  dark,
  searchQuery,
  setSearchQuery,
  setDestination,
  debouncedSearch,
  showDropdown,
  setShowDropdown,
  places,
  loading,
  errorMessage,
}) => {
  return (
    <View style={{ width }} className="px-5 pt-8">
      <Text
        className="text-2xl font-bold dark:text-white mb-2"
        style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
      >
        Where's the next adventure? 🚀
      </Text>
      <Text className="text-gray-400 dark:text-gray-500 mb-8">
        Please select a destination.
      </Text>

      <View className="mb-6 z-50">
        <Text className="text-sm font-semibold mb-2 dark:text-gray-300">
          Destination
        </Text>
        <TextInput
          className="bg-gray-100 dark:bg-dark-seconndary p-4 rounded-xl dark:text-white"
          placeholder="e.g Paris, Lagos"
          placeholderTextColor={dark ? "#666" : "#999"}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setDestination(text);
            debouncedSearch(text, 300);
          }}
        />

        {showDropdown && (
          <View
            className="absolute top-24 left-0 right-0 bg-white dark:bg-dark-seconndary/50 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 overflow-hidden z-50"
            style={{ maxHeight: 200 }}
          >
            <ScrollView nestedScrollEnabled className="z-50">
              {loading && (
                <View className="p-4 gap-y-4">
                  {[1, 2, 3].map((i) => (
                    <View key={i} className="flex-row items-center">
                      <SkeletonBox width={18} height={18} borderRadius={9} />
                      <View className="ml-3 flex-1 gap-y-1.5">
                        <SkeletonBox width="60%" height={14} borderRadius={4} />
                        <SkeletonBox width="90%" height={10} borderRadius={4} />
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {searchQuery.trim().length > 0 &&
                searchQuery.trim().length < 3 &&
                !loading && (
                  <View className="p-10 items-center justify-center">
                    <Ionicons
                      name="search-outline"
                      size={24}
                      color={dark ? "#666" : "#999"}
                    />
                    <Text className="text-gray-400 dark:text-gray-500 text-xs mt-3 font-medium">
                      Type to search destinations
                    </Text>
                  </View>
                )}

              {errorMessage && !loading && (
                <View className="p-10 items-center justify-center">
                  <Ionicons
                    name="alert-circle-outline"
                    size={24}
                    color={dark ? "#666" : "#999"}
                  />
                  <Text className="text-gray-400 dark:text-gray-500 text-xs mt-3 font-medium">
                    {errorMessage}
                  </Text>
                </View>
              )}

              {!loading &&
                !errorMessage &&
                searchQuery.trim().length >= 3 &&
                places.length === 0 && (
                  <View className="p-10 items-center justify-center">
                    <Ionicons
                      name="location-outline"
                      size={24}
                      color={dark ? "#666" : "#999"}
                    />
                    <Text className="text-gray-400 dark:text-gray-500 text-xs mt-3 font-medium text-center">
                      No results found
                    </Text>
                  </View>
                )}

              {places.map((place) => (
                <TouchableOpacity
                  key={place.placeId}
                  className="p-4 border-b border-gray-50 dark:border-white/5 last:border-0"
                  onPress={() => {
                    setDestination(place.displayName);
                    setSearchQuery(place.displayName);
                    setShowDropdown(false);
                  }}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#FF385C"
                      style={{ marginRight: 10 }}
                    />
                    <View className="flex-1">
                      <Text className="dark:text-white font-medium">
                        {place.displayName}
                      </Text>
                      {place.formattedAddress && (
                        <Text className="text-gray-400 text-xs mt-0.5">
                          {place.formattedAddress}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};
