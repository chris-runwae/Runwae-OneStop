import MenuItem from "@/components/ui/MenuItem";
import ScreenHeader from "@/components/ui/ScreenHeader";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { RelativePathString, router } from "expo-router";
import React from "react";
import { View } from "react-native";

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
    <AppSafeAreaView>
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
    </AppSafeAreaView>
  );
};

export default Support;
