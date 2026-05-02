import BoardingHeader from "@/components/boarding/boardingHeader";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const BoardingStep4 = () => {
  const router = useRouter();
  const { setCurrentBoardingStep } = useAuth();
  const [selectedCompanion, setSelectedCompanion] = useState<string>("");

  const companionOptions = [
    "🙋🏽 Just Me (Solo)",
    "👯 Friends",
    "❤️ Partner",
    "👨‍👩‍👧 Family",
    "🌍 Community/Groups",
  ];

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setCurrentBoardingStep(5);
    router.push("/boarding/step-5");
  };

  const handleBack = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setCurrentBoardingStep(3);
    router.replace("/boarding/step-3");
  };

  return (
    <AppSafeAreaView className="px-[20px] items-center justify-between">
      <BoardingHeader currentStep={4} totalSteps={5} onBack={handleBack} />

      <View className="flex-1 gap-y-6 w-full">
        <View className="gap-y-4">
          <Text
            className="text-black dark:text-white text-2xl font-bold"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}
          >
            Who do you usually go with?
          </Text>
          <Text className="text-gray-400 text-sm">
            Select your typical companions for activities
          </Text>
        </View>

        <View className="gap-y-3">
          {companionOptions.map((option) => (
            <TouchableOpacity
              key={option}
              className={`p-4 flex flex-row items-center gap-x-5 border ${
                selectedCompanion === option
                  ? "bg-primary/20 border-primary"
                  : "bg-gray-50 dark:bg-dark-seconndary/50 border-gray-200 dark:border-dark-seconndary"
              }`}
              onPress={() => setSelectedCompanion(option)}
            >
              <View
                className={`h-[20px] w-[20px] rounded-full flex items-center justify-center border ${
                  selectedCompanion === option
                    ? "border-primary"
                    : "border-gray-300 dark:border-dark-seconndary"
                }`}
              >
                {selectedCompanion === option && (
                  <View className="h-[15px] w-[15px] rounded-full bg-primary" />
                )}
              </View>
              <Text
                className={`text-base font-medium ${
                  selectedCompanion === option
                    ? "text-primary"
                    : "text-black dark:text-white"
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
          onPress={handleNext}
        >
          <Text className="text-white font-medium text-base">Next</Text>
        </TouchableOpacity>
      </View>
    </AppSafeAreaView>
  );
};

export default BoardingStep4;
