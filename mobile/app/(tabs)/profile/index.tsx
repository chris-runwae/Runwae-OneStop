import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import CustomSwitch from "@/components/ui/CustomSwitch";
import MainTabHeader from "@/components/ui/MainTabHeader";
import SkeletonBox from "@/components/ui/SkeletonBox";
import { MENU_OPTIONS, MOCK_REWARDS } from "@/constants/profile.constant";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import { ExternalPathString, RelativePathString, router } from "expo-router";
import {
  Check,
  ChevronRight,
  Files,
  LogOut,
  SquarePen,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";

const ProfileScreen = () => {
  const { user, isLoading, signOut } = useAuth();
  const [copied, setCopied] = useState(false);
  const [hostMode, setHostMode] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const { dark } = useTheme();

  return (
    <AppSafeAreaView>
      <MainTabHeader title="Profile" />

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
                <TouchableOpacity
                  activeOpacity={user?.avatar_url ? 0.9 : 1}
                  onPress={() => user?.avatar_url && setShowImagePreview(true)}
                  className="h-[60px] w-[60px] rounded-full bg-gray-200 dark:bg-dark-seconndary overflow-hidden flex items-center justify-center"
                >
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
                </TouchableOpacity>
                <View>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="font-semibold text-xl text-black dark:text-white max-w-[200px]"
                    style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
                  >
                    {user?.full_name}
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

          <TouchableOpacity onPress={() => router.push("/profile/edit")}>
            <SquarePen
              size={20}
              strokeWidth={1.5}
              color={dark ? "#ffffff" : "#000000"}
            />
          </TouchableOpacity>
        </View>

        <View className="mt-5">
          <View className="flex-row gap-x-2 items-center">
            <Text className="font-semibold text-base uppercase text-black dark:text-white">
              Rewards
            </Text>
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
                className="flex-1 h-[62px] border border-gray-200 dark:border-dark-seconndary rounded-[6px] p-[10px] items-start justify-center"
              >
                <Text className="font-bold text-xl text-black dark:text-white">
                  {data.value}
                </Text>
                <Text className="font-light text-sm text-gray-400">
                  {data.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-5">
          <View className="bg-[#F8F9FA] dark:bg-dark-seconndary/50 rounded-[10px] py-[14px] px-[16px] rouded-[8px] border-[0.5px] border-gray-200 dark:border-dark-seconndary flex-row items-center justify-between">
            <Text className="font-semibold text-base text-black dark:text-white">
              Switch to Host Mode
            </Text>
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
                  <View className="h-[40px] w-[40px] flex items-center justify-center rounded-full bg-gray-200 dark:bg-dark-seconndary">
                    <data.icon
                      size={17}
                      strokeWidth={1.5}
                      color={dark ? "#ffffff" : "#343A40"}
                    />
                  </View>
                  <Text className="font-semibold text-base text-black dark:text-white">
                    {data.title}
                  </Text>
                </View>
                <ChevronRight
                  size={17}
                  strokeWidth={1.5}
                  color={dark ? "#ffffff" : "#000000"}
                />
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

      {/* Full Screen Image Preview Modal */}
      <Modal
        visible={showImagePreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePreview(false)}
      >
        <BlurView intensity={80} tint="dark" className="flex-1">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowImagePreview(false)}
            className="flex-1 items-center justify-center relative"
          >
            <TouchableOpacity
              onPress={() => setShowImagePreview(false)}
              className="absolute top-14 right-6 z-10 p-2"
            >
              <X color="white" size={28} strokeWidth={2} />
            </TouchableOpacity>

            {user?.avatar_url && (
              <Image
                source={{ uri: user.avatar_url }}
                className="w-full h-full"
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </BlurView>
      </Modal>
    </AppSafeAreaView>
  );
};

export default ProfileScreen;
