import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Info,
  LucideIcon,
  ShieldAlert,
} from "lucide-react-native";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: LucideIcon;
  color: string;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Support Ticket Updated",
    message: "Your support ticket #1234 has been updated with a new response.",
    time: "2 mins ago",
    icon: Info,
    color: "#3B82F6",
    isRead: false,
  },
  {
    id: "2",
    title: "Security Alert",
    message: "A new login was detected on a Linux device in Lagos, Nigeria.",
    time: "1 hour ago",
    icon: ShieldAlert,
    color: "#EF4444",
    isRead: false,
  },
  {
    id: "3",
    title: "New Feature Available",
    message: "Host mode is now live! Switch in your profile to start hosting.",
    time: "5 hours ago",
    icon: Bell,
    color: "#8B5CF6",
    isRead: true,
  },
  {
    id: "4",
    title: "Upcoming Event",
    message:
      "Don't forget your scheduled call with the team tomorrow at 10 AM.",
    time: "Yesterday",
    icon: Calendar,
    color: "#10B981",
    isRead: true,
  },
];

const NotificationScreen = () => {
  const router = useRouter();
  const { dark } = useTheme();

  const renderItem = ({ item }: { item: (typeof MOCK_NOTIFICATIONS)[0] }) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity
        className={`flex-row p-4 mb-3 rounded-2xl border ${
          item.isRead
            ? "bg-white dark:bg-dark-seconndary/30 border-gray-100 dark:border-dark-seconndary"
            : "bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30"
        }`}
      >
        <View
          style={{ backgroundColor: item.color + "20" }}
          className="h-12 w-12 rounded-full items-center justify-center mr-4"
        >
          <Icon size={22} color={item.color} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text
              className="font-bold text-base text-black dark:text-white flex-1 mr-2"
              style={{ fontFamily: "BricolageGrotesque-Bold" }}
            >
              {item.title}
            </Text>
            <Text className="text-gray-400 text-xs mt-1">{item.time}</Text>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-sm leading-5">
            {item.message}
          </Text>
        </View>
        {!item.isRead && (
          <View className="h-2 w-2 rounded-full bg-primary absolute top-2 right-2" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <AppSafeAreaView>
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-between py-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-seconndary"
          >
            <ArrowLeft
              size={20}
              color={dark ? "#ffffff" : "#000000"}
              strokeWidth={2}
            />
          </TouchableOpacity>
          <Text
            className="text-xl font-bold dark:text-white"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}
          >
            Notifications
          </Text>
          <TouchableOpacity className="h-10 w-10 items-center justify-center" />
        </View>

        <FlatList
          data={MOCK_NOTIFICATIONS}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20 px-10">
              <View className="h-24 w-24 bg-gray-50 dark:bg-dark-seconndary/40 rounded-full items-center justify-center mb-6 border border-gray-100 dark:border-dark-seconndary">
                <Bell
                  strokeWidth={1.2}
                  size={40}
                  color={dark ? "#4B5563" : "#9CA3AF"}
                />
              </View>
              <Text
                className="text-gray-900 dark:text-white text-xl text-center mb-2"
                style={{ fontFamily: "BricolageGrotesque-Bold" }}
              >
                No notifications yet
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center text-base leading-6">
                When you get notifications about your account or activity,
                they'll show up here.
              </Text>
            </View>
          }
        />
      </View>
    </AppSafeAreaView>
  );
};

export default NotificationScreen;
