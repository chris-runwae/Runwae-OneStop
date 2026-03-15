import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";

const OnboardingStep3 = () => {
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  const handleGetStarted = () => {
    completeOnboarding();
    router.push("/(auth)/signup");
  };

  const handleBack = () => {
    router.replace("/(auth)/onboarding-step-2");
  };

  const handleSkip = () => {
    router.push("/(auth)/signup");
  };

  return (
    <AppSafeAreaView className="px-[20px] items-center justify-between">
      <OnboardingHeader currentStep={3} totalSteps={3} onSkip={handleSkip} />

      <View className="flex-1 gap-y-5 w-full">
        <View className="mb-2">
          <Image
            source={require("@/assets/images/onboarding-main-3.png")}
            style={{ width: "auto", height: 332, resizeMode: "contain" }}
          />
        </View>
        <View className="gap-y-2">
          <Text
            className="text-black dark:text-white text-3xl"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}
          >
            One app, your {"\n"}while trip.
          </Text>

          <Text className="text-sm text-gray-400">
            All your tickets, bookings, activities, and {"\n"}itinerary; all in
            one place.
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
          onPress={handleGetStarted}
        >
          <Text className="text-white font-medium text-base">Get Started</Text>
        </TouchableOpacity>
      </View>
    </AppSafeAreaView>
  );
};

export default OnboardingStep3;
