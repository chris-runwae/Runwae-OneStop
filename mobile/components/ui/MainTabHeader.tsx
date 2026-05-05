// import NotificationBell from "@/components/ui/NotificationBell";
import React from "react";
import { Text, View } from "react-native";

interface MainTabHeaderProps {
  title: string;
}

const MainTabHeader = ({ title }: MainTabHeaderProps) => {
  return (
    <View className="flex flex-row items-center justify-between py-5 border-b-2 border-b-gray-200 dark:border-b-dark-seconndary px-[20px]">
      <Text
        className="font-semibold text-2xl dark:text-white"
        style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
      >
        {title}
      </Text>
      {/* <NotificationBell /> */}
    </View>
  );
};

export default MainTabHeader;
