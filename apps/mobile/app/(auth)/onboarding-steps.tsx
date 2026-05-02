import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeInRight,
  FadeOutLeft,
} from "react-native-reanimated";

const ONBOARDING_DATA = [
  {
    id: 1,
    image: require("@/assets/images/onboarding-main-1.png"),
    title: "Find events worth \nthe trip.",
    description: "Concerts, sports, festivals, and more; see what’s \nhappening around the world and near you.",
  },
  {
    id: 2,
    image: require("@/assets/images/onboarding-main-2.png"),
    title: "Trips are better \nwith friends.",
    description: "Invite your crew, vote on plans, and split costs; \nno endless group chats needed.",
  },
  {
    id: 3,
    image: require("@/assets/images/onboarding-main-3.png"),
    title: "One app, your \nwhile trip.",
    description: "All your tickets, bookings, activities, and \nitinerary; all in one place.",
  },
];

const OnboardingSteps = () => {
  const router = useRouter();
  const { nextOnboardingStep, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_DATA.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeOnboarding();
      router.push("/(auth)/signup");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    router.push("/(auth)/signup");
  };

  const step = ONBOARDING_DATA[currentStep];
  const isLastStep = currentStep === ONBOARDING_DATA.length - 1;

  return (
    <AppSafeAreaView className="px-[20px] items-center justify-between">
      <OnboardingHeader
        currentStep={currentStep + 1}
        totalSteps={ONBOARDING_DATA.length}
        onSkip={handleSkip}
      />

      <Animated.View
        key={currentStep}
        entering={FadeInRight.duration(300)}
        exiting={FadeOutLeft.duration(300)}
        className="flex-1 gap-y-5 w-full"
      >
        <View className="mb-2">
          <Image
            source={step.image}
            style={{ width: "auto", height: 332, resizeMode: "contain" }}
          />
        </View>
        <View className="gap-y-2">
          <Text
            className="text-black dark:text-white text-3xl"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}
          >
            {step.title}
          </Text>

          <Text className="text-sm text-gray-400">
            {step.description}
          </Text>
        </View>
      </Animated.View>

      <View className="flex-row items-center gap-x-2 w-full">
        {currentStep > 0 && (
          <TouchableOpacity
            className="bg-primary/10 border border-primary/20 dark:bg-primary/20 h-[45px] px-[40px] rounded-full items-center justify-center"
            onPress={handleBack}
          >
            <Text className="text-primary font-medium text-base">Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`bg-primary h-[45px] rounded-full flex-1 items-center justify-center`}
          onPress={handleNext}
        >
          <Text className="text-white font-medium text-base">
            {isLastStep ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </AppSafeAreaView>
  );
};

export default OnboardingSteps;
