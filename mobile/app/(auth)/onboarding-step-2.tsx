import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const OnboardingStep2 = () => {
  const router = useRouter();
  const { nextOnboardingStep } = useAuth();

  const handleNext = () => {
    nextOnboardingStep();
    router.push("/(auth)/onboarding-step-3");
  };

  const handleBack = () => {
    router.replace("/(auth)/onboarding-step-1");
  };

  const handleSkip = () => {
    router.push("/(auth)/signup");
  };

  return (
    <AppSafeAreaView className="px-[20px] items-center justify-between">
      <OnboardingHeader currentStep={2} totalSteps={3} onSkip={handleSkip} />

      <View className="flex-1 gap-y-5 w-full">
        <View className="mb-2">
          <Image
            source={require("@/assets/images/onboarding-main-2.png")}
            style={{ width: "auto", height: 332, resizeMode: "contain" }}
          />
        </View>
        <View className="gap-y-2">
          <Text
            className="text-black dark:text-white text-3xl"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}
          >
            Trips are better {"\n"}with friends.
          </Text>

          <Text className="text-sm text-gray-400">
            Invite your crew, vote on plans, and split costs; {"\n"}no endless
            group chats needed.
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-x-2">
        <TouchableOpacity
          className="bg-primary/10 border border-primary/20 dark:bg-primary/20 h-[45px] px-[40px] rounded-full items-center justify-center"
          onPress={handleBack}
        >
          <Text className="text-primary font-medium text-base">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-primary h-[45px] rounded-full flex-1 w-full items-center justify-center"
          onPress={handleNext}
        >
          <Text className="text-white font-medium text-base">Next</Text>
        </TouchableOpacity>
      </View>
    </AppSafeAreaView>
  );
};

export default OnboardingStep2;
