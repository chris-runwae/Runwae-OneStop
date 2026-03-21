import AddOnCard from "@/components/home/AddOnCard";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { AddOnCardSkeleton } from "@/components/ui/CardSkeletons";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SearchInput from "@/components/ui/SearchInput";
import {
  ADD_ONS_FOR_YOU,
  EXPERIENCE_HIGHLIGHTS,
} from "@/constants/home.constant";
import React, { useMemo, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";

const ALL_EXPERIENCES = [...ADD_ONS_FOR_YOU, ...EXPERIENCE_HIGHLIGHTS];

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

const ExperienceScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredExperiences = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return ALL_EXPERIENCES.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const displayData = loading ? Array(5).fill({}) : filteredExperiences;

  return (
    <AppSafeAreaView edges={["top"]}>
      <ScreenHeader hasBorder={false} title="Experiences" />
      <View className="mt-5 px-[20px] pb-5 border-b-2 border-b-gray-200 dark:border-b-dark-seconndary">
        <SearchInput
          placeholder="Try searching “Eiffel tour tour”"
          showFilter={false}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {!loading && filteredExperiences.length === 0 ? (
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
          keyExtractor={(item, index) =>
            loading ? `skeleton-${index}` : item.id
          }
          ItemSeparatorComponent={() => <View className="h-6" />}
          renderItem={({ item }) =>
            loading ? (
              <AddOnCardSkeleton fullWidth={true} />
            ) : (
              <View className="items-center">
                <AddOnCard fullWidth item={item} />
              </View>
            )
          }
          ListEmptyComponent={<View />}
        />
      )}
    </AppSafeAreaView>
  );
};

export default ExperienceScreen;
