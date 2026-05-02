import { ExploreCategory } from "@/constants/home.constant";
import { X } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface ExploreCategoriesProps {
  categories: ExploreCategory[];
  selectedCategory: string;
  onCategoryPress: (category: string) => void;
  showClear?: boolean;
  onClear?: () => void;
}

const ExploreCategories = ({
  categories,
  selectedCategory,
  onCategoryPress,
  showClear,
  onClear,
}: ExploreCategoriesProps) => {
  return (
    <View className="mt-4 mb-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        <View className="flex-row items-center">
          {showClear && (
            <TouchableOpacity
              onPress={onClear}
              className="flex-row items-center px-3 py-2 rounded-full mr-3 bg-primary border border-primary"
            >
              <X size={14} color="white" strokeWidth={3} />
              <Text className="text-sm font-bold text-white ml-1">Clear</Text>
            </TouchableOpacity>
          )}
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onCategoryPress(item.name)}
              className={`flex-row items-center px-2 py-2 rounded-full mr-3 border ${
                selectedCategory === item.name
                  ? "bg-primary/30 border-primary"
                  : "bg-gray-100 border-gray-200 dark:bg-dark-seconndary/50 dark:border-dark-seconndary"
              }`}
            >
              <Text className="text-sm mr-1">{item.emoji}</Text>
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === item.name
                    ? "text-primary font-bold"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ExploreCategories;
