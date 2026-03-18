import NotificationBell from "@/components/ui/NotificationBell";
import SkeletonBox from "@/components/ui/SkeletonBox";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import React from "react";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";

interface HomeHeaderProps {
  user: any;
  isLoading: boolean;
  dark: boolean;
}

const HomeHeader = ({ user, isLoading, dark }: HomeHeaderProps) => {
  return (
    <View className="flex flex-row items-center justify-between gap-x-5 py-5 border-b-2 border-b-gray-200 dark:border-b-dark-seconndary px-[20px]">
      {isLoading ? (
        <View className="flex-row items-center gap-x-2">
          <SkeletonBox width={40} height={40} borderRadius={20} />
          <View style={{ gap: 4 }}>
            <SkeletonBox width={40} height={12} />
            <SkeletonBox width={100} height={18} />
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => router.push("/profile")}
          className="flex-row items-center gap-x-2"
        >
          <View className="h-[40px] w-[40px] rounded-full bg-gray-200 dark:bg-dark-seconndary overflow-hidden flex items-center justify-center">
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-xl font-bold text-gray-500 dark:text-gray-200">
                {(user?.full_name || "John Doe")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)}
              </Text>
            )}
          </View>

          <View>
            <Text className="text-sm text-gray-400">Hey!</Text>
            <Text className="text-lg font-semibold text-black dark:text-white">
              {user?.full_name || "John Doe"}
            </Text>
          </View>
        </Pressable>
      )}

      <View className="flex-row items-center gap-x-3">
        <TouchableOpacity
          onPress={() => router.push("/trips")}
          className="h-[40px] flex-row gap-x-1 w-[112px] flex items-center justify-center rounded-full bg-transparent border border-dashed border-gray-300 dark:border-gray-500"
        >
          <Plus
            size={17}
            strokeWidth={1.5}
            color={dark ? "#ffffff" : "#000000"}
          />
          <Text className="text-sm text-black dark:text-white">
            Plan a Trip
          </Text>
        </TouchableOpacity>

        <NotificationBell />
      </View>
    </View>
  );
};

export default HomeHeader;
