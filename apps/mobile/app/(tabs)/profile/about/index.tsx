import { ABOUT_ITEMS } from "@/constants/about.constant";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import MenuItem from "@/components/ui/MenuItem";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { RelativePathString, router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

// Updates.createdAt is the publish date of the currently-loaded JS
// bundle (an OTA update, when one has been applied; null on the
// embedded bundle that ships with the build). Showing it tells the
// user how fresh their installed code is — much more useful than a
// hardcoded marketing date.
function formatBundleDate(): string {
  const updateDate = Updates.createdAt;
  if (!updateDate) return "Embedded with build";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
  }).format(updateDate);
}

const AboutScreen = () => {
  const version = Constants.expoConfig?.version || "1.0.0";
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ||
    Constants.expoConfig?.android?.versionCode ||
    "1";

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
            Version {version} (Build {buildNumber})
          </Text>
          <Text className="text-sm text-gray-400">
            Updated: {formatBundleDate()}
          </Text>
        </View>
      </View>
    </AppSafeAreaView>
  );
};

export default AboutScreen;
