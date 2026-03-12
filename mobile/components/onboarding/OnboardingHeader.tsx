import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface OnboardingHeaderProps {
  currentStep: number;
  totalSteps: number;
  onSkip?: () => void;
}

const OnboardingHeader = ({
  currentStep,
  totalSteps,
  onSkip,
}: OnboardingHeaderProps) => {
  return (
    <View className="flex-row w-full justify-between items-center mb-8">
      <View className="flex-row gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            className={`h-1 rounded-full ${
              index < currentStep ? "w-8 bg-primary" : "w-8 bg-gray-300"
            }`}
          />
        ))}
      </View>

      {onSkip && (
        <TouchableOpacity onPress={onSkip}>
          <Text className="text-gray-400 underline text-sm">Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default OnboardingHeader;
