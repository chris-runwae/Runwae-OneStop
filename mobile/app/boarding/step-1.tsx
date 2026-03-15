import BoardingHeader from "@/components/boarding/boardingHeader";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";

const BoardingStep1 = () => {
  const router = useRouter();
  const { setCurrentBoardingStep } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string>("");

  const options = [
    "🎟️ Discover events",
    "✈️ Plan group trips",
    "🎤 Host Events",
    "💰 Find Travel Deals",
  ];

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentBoardingStep(2);
    router.push("/boarding/step-2");
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(tabs)");
  };

  return (
    <AppSafeAreaView className="px-[20px] items-center justify-between">
      <BoardingHeader currentStep={1} totalSteps={4} onSkip={handleSkip} />

      <View className="flex-1 gap-y-6 w-full">
        <View className="gap-y-4">
          <Text
            className="text-black dark:text-white text-2xl font-bold"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}
          >
            What brings you to Runwae?
          </Text>
          <Text className="text-gray-400 text-sm">
            Let’s set the tone for your experience. What do {"\n"} you want to
            do here?
          </Text>
        </View>

        <View className="gap-y-3">
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              className={`p-4 flex flex-row items-center gap-x-5 border ${
                selectedOption === option
                  ? "bg-primary/20 border-primary"
                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              }`}
              onPress={() => setSelectedOption(option)}
            >
              <View
                className={`h-[20px] w-[20px] rounded-full flex items-center justify-center border ${
                  selectedOption === option
                    ? "border-primary"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              >
                {selectedOption === option && (
                  <View className="h-[15px] w-[15px] rounded-full bg-primary" />
                )}
              </View>
              <Text
                className={`text-base font-medium ${
                  selectedOption === option ? "text-primary" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        className="bg-primary h-[45px] rounded-full w-full flex items-center justify-center"
        onPress={handleNext}
      >
        <Text className="text-white font-medium text-base">Next</Text>
      </TouchableOpacity>
    </AppSafeAreaView>
  );
};

export default BoardingStep1;
