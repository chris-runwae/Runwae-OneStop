import { OAuthProviderData } from "@/constants/auth.constant";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";

const OnboardingScreen = () => {
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(auth)/onboarding-step-1");
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    completeOnboarding();
    setTimeout(() => {
      router.replace("/(auth)/login");
    }, 100);
  };

  return (
    <AppSafeAreaView className="px-[20px] items-center justify-between">
      <View className="flex-1 items-center gap-y-5 w-full">
        <View className="my-10">
          <Image
            source={require("@/assets/images/onboarding-1.png")}
            style={{ width: 321, height: 276.45, resizeMode: "contain" }}
          />
        </View>
        <Text
          className="text-black dark:text-white text-center text-3xl"
          style={{ fontFamily: "BricolageGrotesque-Bold" }}
        >
          Travel round the world {"\n"}without worries
        </Text>

        <View className="flex-col gap-3 w-full">
          <TouchableOpacity
            className="bg-primary h-[45px] rounded-full w-full flex items-center justify-center"
            onPress={handleGetStarted}
          >
            <Text className="text-white font-medium text-base">
              Create Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            className="bg-primary/10 border border-primary/20 h-[45px] rounded-full w-full flex items-center justify-center"
          >
            <Text className="text-primary font-medium text-base">Log in</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800" />
          <View className="h-[30px] w-[30px] flex-row items-center justify-center">
            <Text className="text-gray-400">or</Text>
          </View>
          <View className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800" />
        </View>

        <View className="flex-row items-center gap-x-5">
          {OAuthProviderData.map((data, index) => (
            <TouchableOpacity
              key={index}
              className="h-[50px] w-[50px] rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center"
            >
              {data.icon}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text className="text-center text-sm text-gray-400">
        By proceeding, I have read and accepted the{" "}
        <Text onPress={() => {}} className="text-primary underline">
          terms
        </Text>{" "}
        and{"\n"}
        <Text onPress={() => {}} className="text-primary underline">
          privacy policy
        </Text>
        .
      </Text>
    </AppSafeAreaView>
  );
};

export default OnboardingScreen;
