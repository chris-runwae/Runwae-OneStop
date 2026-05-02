import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import MenuItem from "@/components/ui/MenuItem";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { POLICY_SECTIONS } from "@/constants/about.constant";
import { RelativePathString, router } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const TermsPoliciesScreen = () => {
  return (
    <AppSafeAreaView>
      <ScreenHeader
        title="Terms & Policies"
        subtitle="Legal information and guidelines"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-[20px] mt-6 gap-y-2">
          <Text className="text-base text-gray-500 dark:text-gray-400 mb-4">
            Find the details that keep everything running smoothly.
          </Text>

          <View>
            {POLICY_SECTIONS.map((section) => (
              <MenuItem
                key={section.route}
                title={section.title}
                hasBorder
                onPress={() => router.push(section.route as RelativePathString)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </AppSafeAreaView>
  );
};

export default TermsPoliciesScreen;
