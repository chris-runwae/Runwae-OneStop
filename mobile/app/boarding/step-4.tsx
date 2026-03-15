import BoardingHeader from "@/components/boarding/boardingHeader";
import { useAuth } from "@/hooks/useAuth";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";

const BoardingStep4 = () => {
  const router = useRouter();
  const { completeBoarding } = useAuth();
  const [selectedBudget, setSelectedBudget] = useState<string>("");

  const budgetOptions = [
    "💸 Free & budget-friendly",
    "💳 Mid-range",
    "💎 Premium experiences",
  ];

  const handleComplete = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await completeBoarding();
    router.replace("/(tabs)");
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/boarding/step-3");
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await completeBoarding();
    router.replace("/(tabs)");
  };

  return (
    <AppSafeAreaView className="px-[20px] items-center justify-between">
      <BoardingHeader
        currentStep={4}
        totalSteps={4}
        onSkip={handleSkip}
        onBack={handleBack}
      />

      <View className="flex-1 gap-y-6 w-full">
        <View className="gap-y-4">
          <Text
            className="text-black dark:text-white text-2xl font-bold"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}
          >
            What's your budget comfort zone?
          </Text>
          <Text className="text-gray-400 text-sm">
            No judgment — just helping us recommend the right options.
          </Text>
        </View>

        <View className="gap-y-3">
          {budgetOptions.map((option) => (
            <TouchableOpacity
              key={option}
              className={`p-4 flex flex-row items-center gap-x-5 border ${
                selectedBudget === option
                  ? "bg-primary/20 border-primary"
                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              }`}
              onPress={() => setSelectedBudget(option)}
            >
              <View
                className={`h-[20px] w-[20px] rounded-full flex items-center justify-center border ${
                  selectedBudget === option
                    ? "border-primary"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              >
                {selectedBudget === option && (
                  <View className="h-[15px] w-[15px] rounded-full bg-primary" />
                )}
              </View>
              <Text
                className={`text-base font-medium ${
                  selectedBudget === option ? "text-primary" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
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
          onPress={handleComplete}
        >
          <Text className="text-white font-medium text-base">Get Started</Text>
        </TouchableOpacity>
      </View>
    </AppSafeAreaView>
  );
};

export default BoardingStep4;
