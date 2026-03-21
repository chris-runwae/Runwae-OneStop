import { ABOUT_ITEMS } from "@/constants/about.constant";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import MenuItem from "@/components/ui/MenuItem";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Constants from "expo-constants";
import { RelativePathString, router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const AboutScreen = () => {
  return (
    <AppSafeAreaView>
      <ScreenHeader title="About Us" />

      <View className="mt-5 px-[20px]">
        <View>
          {ABOUT_ITEMS.map((item) => (
            <MenuItem
              key={item.route}
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => router.push(item.route as RelativePathString)}
            />
          ))}
        </View>

        <View className="mt-2">
          <Text className="font-semibold text-base text-black dark:text-white">
            App Version
          </Text>
          <Text className="text-sm text-gray-400 mt-0.5">
            Version {Constants.expoConfig?.version || "1.0.0"} (Build{" "}
            {Constants.expoConfig?.ios?.buildNumber ||
              Constants.expoConfig?.android?.versionCode ||
              "1"}
            )
          </Text>
          <Text className="text-sm text-gray-400">Updated: March 2026</Text>
        </View>
      </View>
    </AppSafeAreaView>
  );
};

export default AboutScreen;
