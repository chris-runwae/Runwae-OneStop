import MenuItem from "@/components/ui/MenuItem";
import { RelativePathString, router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-bg">
      <View className="flex flex-row items-center gap-x-5 py-5 border-b-2 border-b-gray-200 px-[20px]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-[35px] w-[35px] flex items-center justify-center rounded-full bg-gray-200"
        >
          <ArrowLeft size={18} strokeWidth={1.5} color={"#000000"} />
        </TouchableOpacity>
        <Text
          className="font-semibold text-2xl"
          style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
        >
          Get Help
        </Text>
      </View>

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
