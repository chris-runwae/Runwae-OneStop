import { useAuth } from "@/hooks/useAuth";
import * as Clipboard from "expo-clipboard";
import { Bell, Check, Files } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  console.log(user);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-bg">
      <View className="flex flex-row items-center justify-between py-5 border-b-2 border-b-gray-200 px-[20px]">
        <Text
          className="font-semibold text-3xl"
          style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
        >
          Profile
        </Text>
        <TouchableOpacity className="h-[40px] w-[40px] flex items-center justify-center rounded-full bg-gray-200">
          <Bell size={15} strokeWidth={1.5} color={"#000000"} />
        </TouchableOpacity>
      </View>

      <View className="px-[20px] mt-5">
        <View className="flex flex-row items-center justify-between">
          <View className="flex-row gap-x-3 items-center">
            <View className="h-[60px] w-[60px] rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-xl font-bold text-gray-500">
                  {(user?.name || "John Doe")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)}
                </Text>
              )}
            </View>
            <View>
              <Text
                className="font-semibold text-xl"
                style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
              >
                {user?.name || "John Doe"}
              </Text>
              <View className="flex-row items-center gap-x-1">
                <Text className="text-gray-400 font-light text-sm">
                  @{user?.username || "johndoe"}
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    const username = user?.username || "johndoe";
                    await Clipboard.setStringAsync(`@${username}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? (
                    <Check size={13} color={"#10b981"} strokeWidth={1.5} />
                  ) : (
                    <Files size={13} color={"#9ca3af"} strokeWidth={1.5} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
