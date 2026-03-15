import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import OptionButtons from "@/components/ui/OptionButtons";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { SOCIAL_LINKS } from "@/constants/about.constant";
import React from "react";
import { Linking, Text, View } from "react-native";

const ConnectWithUsScreen = () => {
  const handlePress = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err),
    );
  };

  return (
    <AppSafeAreaView>
      <ScreenHeader
        title="Connect with Us"
        subtitle="Stay updated with the latest from Runwae"
      />

      <View className="mt-5 px-[20px] flex-1 relative">
        <Text className="text-base text-gray-400">
          Stay in touch and explore the world with us on social media.
        </Text>

        <View className="flex-col mt-5">
          {SOCIAL_LINKS.map((item) => (
            <OptionButtons
              key={item.name}
              title={item.name}
              icon={item.icon}
              onPress={() => handlePress(item.url)}
            />
          ))}
        </View>
      </View>
    </AppSafeAreaView>
  );
};

export default ConnectWithUsScreen;
