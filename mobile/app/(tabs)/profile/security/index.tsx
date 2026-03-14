import MenuItem from "@/components/ui/MenuItem";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { RelativePathString, router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SECURITY_ITEMS: { title: string; subtitle: string; route: string }[] = [
  {
    title: "Change your password",
    subtitle: "Keep your account secure with a new password.",
    route: "/profile/security/change-password",
  },
  {
    title: "Two-factor authentication",
    subtitle: "Add an extra layer of protection to your account.",
    route: "/profile/security/two-factor-authentication",
  },
  {
    title: "Privacy settings",
    subtitle: "Control who can see your trips or invites",
    route: "/profile/security/privacy-settings",
  },
];

const SecurityScreen = () => {
  return (
    <SafeAreaView className="flex-1">
      <ScreenHeader title="Security" />

      <View className="mt-5 px-[20px]">
        <View>
          {SECURITY_ITEMS.map((item) => (
            <MenuItem
              key={item.route}
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => router.push(item.route as RelativePathString)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SecurityScreen;
