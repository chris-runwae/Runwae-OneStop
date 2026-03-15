import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface OnboardingHeaderProps {
  currentStep: number;
  totalSteps: number;
  onSkip?: () => void;
  onBack?: () => void;
}

const BoardingHeader = ({
  currentStep,
  totalSteps,
  onSkip,
  onBack,
}: OnboardingHeaderProps) => {
  const radius = 18;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const progress = currentStep / totalSteps;
  const strokeDashoffset = circumference * (1 - progress);
  const size = (radius + strokeWidth) * 2;

  const { dark } = useTheme();

  return (
    <View className="flex-row w-full justify-between items-center mb-8">
      <TouchableOpacity
        onPress={onBack || (() => router.back())}
        className="w-[40px] h-[40px] rounded-full bg-gray-200 dark:bg-dark-seconndary flex items-center justify-center"
      >
        <ArrowLeft size={15} color={dark ? "#ffffff" : "#374151"} />
      </TouchableOpacity>

      {/* Circular progress */}
      <View
        className="items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={dark ? "#212529" : "#E5E7EB"}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FF1F8C"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View className="absolute flex-row items-baseline">
          <Text style={{ color: "#FF1F8C", fontSize: 13, fontWeight: "600" }}>
            {currentStep}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 10 }}>/{totalSteps}</Text>
        </View>
      </View>

      {onSkip ? (
        <TouchableOpacity onPress={onSkip}>
          <Text className="text-gray-400 underline text-sm">Skip</Text>
        </TouchableOpacity>
      ) : (
        <View className="w-[40px]" />
      )}
    </View>
  );
};

export default BoardingHeader;
