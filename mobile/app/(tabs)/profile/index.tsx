import CustomSwitch from "@/components/ui/CustomSwitch";
import { MENU_OPTIONS, MOCK_REWARDS } from "@/constants/profile.constant";
import { useAuth } from "@/hooks/useAuth";
import * as Clipboard from "expo-clipboard";
import { ExternalPathString, RelativePathString, router } from "expo-router";
import {
  Bell,
  Check,
  ChevronRight,
  Files,
  LogOut,
  SquarePen,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SkeletonBox = ({
  width,
  height,
  borderRadius = 8,
}: {
  width: number;
  height: number;
  borderRadius?: number;
}) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: "#E5E7EB",
        opacity,
      }}
    />
  );
};

const ProfileScreen = () => {
  const { user, isLoading, signOut } = useAuth();
  const [copied, setCopied] = useState(false);
  const [hostMode, setHostMode] = useState(false);

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
            {isLoading ? (
              <>
                <SkeletonBox width={60} height={60} borderRadius={30} />
                <View style={{ gap: 8 }}>
                  <SkeletonBox width={128} height={24} />
                  <SkeletonBox width={96} height={16} />
                </View>
              </>
            ) : (
              <>
                <View className="h-[60px] w-[60px] rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {user?.avatar_url ? (
                    <Image
                      source={{ uri: user.avatar_url }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-xl font-bold text-gray-500">
                      {(user?.full_name || "John Doe")
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
                    {user?.full_name || "John Doe"}
                  </Text>
                  <View className="flex-row items-center gap-x-1">
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="text-gray-400 font-light text-sm max-w-[150px]"
                    >
                      {user?.email}
                    </Text>
                    <TouchableOpacity
                      onPress={async () => {
                        const emailAddress = user?.email || "...";
                        await Clipboard.setStringAsync(emailAddress);
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
              </>
            )}
          </View>

          <TouchableOpacity>
            <SquarePen size={20} strokeWidth={1.5} color={"#000000"} />
          </TouchableOpacity>
        </View>

        <View className="mt-5">
          <View className="flex-row gap-x-2 items-center">
            <Text className="font-semibold text-base uppercase">Rewards</Text>
            <View className="py-[4px] px-[6px] h-full rounded-[4px] bg-primary/10">
              <Text className="text-sm font-semibold text-primary">
                Coming soon
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center gap-x-3">
            {MOCK_REWARDS.map((data, index) => (
              <View
                key={index}
                className="flex-1 h-[62px] border border-gray-200 rounded-[6px] p-[10px] items-start justify-center"
              >
                <Text className="font-bold text-xl">{data.value}</Text>
                <Text className="font-light text-sm text-gray-400">
                  {data.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-5">
          <View className="bg-[#F8F9FA] rounded-[10px] py-[14px] px-[16px] rouded-[8px] border-[0.5px] border-gray-200 flex-row items-center justify-between">
            <Text className="font-semibold text-base">Switch to Host Mode</Text>
            <CustomSwitch
              value={hostMode}
              onValueChange={setHostMode}
              inactiveColor="#ADB5BD"
            />
          </View>
        </View>

        <View className="mt-5">
          <View className="flex-col gap-y-6">
            {MENU_OPTIONS.map((data, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  router.push(
                    data.route as RelativePathString | ExternalPathString,
                  )
                }
                className="flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-x-4">
                  <View className="h-[40px] w-[40px] flex items-center justify-center rounded-full bg-gray-200">
                    <data.icon size={17} strokeWidth={1.5} color={"#343A40"} />
                  </View>
                  <Text className="font-semibold text-base">{data.title}</Text>
                </View>
                <ChevronRight size={17} strokeWidth={1.5} color={"#000000"} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => signOut()}
              className="flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-x-4">
                <View className="h-[40px] w-[40px] flex items-center justify-center rounded-full bg-[#F61801]">
                  <LogOut size={17} strokeWidth={1.5} color={"#ffffff"} />
                </View>
                <Text className="font-semibold text-base text-[#F61801]">
                  Log out
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
