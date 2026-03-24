import {
  ACTIVITY_NOTIFICATIONS,
  FOR_YOU_NOTIFICATIONS,
  Notification,
} from "@/constants/notifications.constant";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

const NotificationScreen = () => {
  const router = useRouter();
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState<"For You" | "Activity">("For You");

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    if (item.type === "social") {
      return (
        <View className="flex-row items-start py-4 border-b border-gray-100 dark:border-dark-seconndary/50">
          <Image
            source={{ uri: item.user?.avatar }}
            className="h-[40px] w-[40px] rounded-full mr-3"
          />
          <View className="flex-1 mr-2">
            <Text className="text-[14px] leading-5 dark:text-gray-200">
              <Text className="font-bold text-black dark:text-white">
                {item.user?.name}{" "}
              </Text>
              <Text className="text-gray-400 font-normal">{item.action} </Text>
              <Text className="font-bold text-black dark:text-white">
                {item.subject}
              </Text>
            </Text>
            <Text className="text-gray-400 text-[12px] mt-4">{item.time}</Text>
          </View>
          {item.thumbnail && (
            <Image
              source={{ uri: item.thumbnail }}
              className="h-[60px] w-[60px] rounded-lg"
            />
          )}
        </View>
      );
    }

    // System Style
    const Icon = item.icon;
    return (
      <View className="flex-row items-start py-4 border-b border-gray-100 dark:border-dark-seconndary/50">
        <View className="h-[40px] w-[40px] rounded-full bg-gray-200 dark:bg-dark-seconndary mr-3 items-center justify-center">
          {Icon && (
            <Icon
              size={17}
              color={dark ? "#9CA3AF" : "#6B7280"}
              strokeWidth={1.5}
            />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-[14px] leading-5 dark:text-gray-200">
            {item.title && (
              <Text className="font-bold text-black dark:text-white">
                {item.title}{" "}
              </Text>
            )}
            <Text className="text-gray-400 font-normal">{item.message}</Text>
            {item.subject && (
              <Text className="font-bold text-black dark:text-white">
                {" "}
                {item.subject}
              </Text>
            )}
          </Text>
          <Text className="text-gray-400 text-[12px] mt-4">{item.time}</Text>
        </View>
      </View>
    );
  };

  const ForYouEmptyState = () => (
    <View className="flex-1 bg-gray-200/60 dark:bg-dark-seconndary/40 items-center justify-center px-10">
      <View className="relative items-center mb-5">
        <Image
          source={require("@/assets/images/notification-bell.png")}
          className="h-[80px] w-[80px]"
          resizeMode="contain"
        />
      </View>
      <Text
        className="text-black dark:text-white text-xl text-center mb-2"
        style={{ fontFamily: "BricolageGrotesque-Bold" }}
      >
        No Notifications
      </Text>
      <Text className="text-gray-400 dark:text-gray-400 text-center text-sm leading-6 max-w-[240px]">
        You don't have any notifications yet. Check back later!
      </Text>
    </View>
  );

  const activeData =
    activeTab === "For You" ? FOR_YOU_NOTIFICATIONS : ACTIVITY_NOTIFICATIONS;

  return (
    <AppSafeAreaView edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-[20px] pt-4 pb-2 gap-x-5 flex-row items-center">
          <View className="flex-row items-center gap-x-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-[35px] w-[35px] flex items-center justify-center rounded-full bg-gray-200 dark:bg-dark-seconndary"
            >
              <ArrowLeft
                size={18}
                strokeWidth={1.5}
                color={dark ? "#ffffff" : "#000000"}
              />
            </TouchableOpacity>
          </View>
          <Text
            className="font-semibold text-2xl text-black dark:text-white"
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
          >
            Notifications
          </Text>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row px-[20px] py-4 gap-x-3 border-b border-gray-100 dark:border-dark-seconndary">
          {(["For You", "Activity"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-5 py-[6px] rounded-full ${
                activeTab === tab
                  ? "bg-primary"
                  : "bg-gray-100 dark:bg-dark-seconndary"
              }`}
            >
              <Text
                className={`text-sm  ${
                  activeTab === tab
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-300"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeData.length > 0 ? (
          <FlatList
            data={activeData}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          />
        ) : (
          <ForYouEmptyState />
        )}
      </View>
    </AppSafeAreaView>
  );
};

export default NotificationScreen;
