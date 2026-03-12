import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OnboardingStep1 = () => {
  const router = useRouter();

  const handleNext = () => {
    router.replace("/(auth)/onboarding-step-2");
  };

  const handleSkip = () => {
    router.replace("/(auth)/signup");
  };

  return (
    <SafeAreaView className="flex-1 px-[20px] items-center justify-between bg-white h-screen">
      <OnboardingHeader currentStep={1} totalSteps={3} onSkip={handleSkip} />

      <View className="flex-1 gap-y-5 w-full">
        <View className="mb-2">
          <Image
            source={require("@/assets/images/onboarding-main-1.png")}
            style={{ width: "auto", height: 332, resizeMode: "contain" }}
          />
        </View>
        <View className="gap-y-2">
          <Text
            className="text-black text-3xl"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}
          >
            Find events worth {"\n"}the trip.
          </Text>

          <Text className="text-sm text-gray-400">
            Concerts, sports, festivals, and more; see what’s {"\n"}happening
            around the world and near you.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="bg-primary h-[45px] rounded-full w-full flex items-center justify-center"
        onPress={handleNext}
      >
        <Text className="text-white font-medium text-base">Next</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OnboardingStep1;
