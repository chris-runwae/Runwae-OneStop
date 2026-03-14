import MenuItem from "@/components/ui/MenuItem";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { RelativePathString, router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SUPPORT_ITEMS: { title: string; route: string }[] = [
  {
    title: "Visit Help Center",
    route: "/profile/support/help-center",
  },
  {
    title: "Contact Support",
    route: "/profile/support/contact-support",
  },
  {
    title: "Report an Issue",
    route: "/profile/support/report-issue",
  },
  {
    title: "Give Feedback & Suggestions",
    route: "/profile/support/feedback",
  },
];

const Support = () => {

  return (
    <SafeAreaView className="flex-1">
      <ScreenHeader title="Get Help" />

      <View className="mt-5 px-[20px]">
        <View>
          {SUPPORT_ITEMS.map((item) => (
            <MenuItem
              key={item.route}
              title={item.title}
              onPress={() => router.push(item.route as RelativePathString)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Support;
