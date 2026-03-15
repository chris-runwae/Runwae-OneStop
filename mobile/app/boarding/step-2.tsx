import BoardingHeader from "@/components/boarding/boardingHeader";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const BoardingStep2 = () => {
  const router = useRouter();
  const { setCurrentBoardingStep } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interestOptions = [
    " 🎵 Music Festivals",
    " 🎨 Arts & Culture",
    " 🌃 Nightlife",
    " 📚 Conferences",
    " 🖼️ Exhibitions",
    " 📖 Book Fairs",
    "🧵 Craft Fairs",
    "🎤 Open Mic Nights",
    "🧘 Wellness Retreats",
    "🌳 Parks",
    "🍔 Food Festivals",
    "🎪 Carnivals",
    "🏛️ Historical Tours",
    "🎭 Themed Parties",
    "🧗 Adventures",
    "🌠 Stargazing Events",
    "🎵 Music",
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentBoardingStep(3);
    router.push("/boarding/step-3");
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentBoardingStep(1);
    router.replace("/boarding/step-1");
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(tabs)");
  };

  return (
    <AppSafeAreaView className="px-[20px] items-center justify-between">
      <BoardingHeader
        currentStep={2}
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
            What type of events are you most interested in?
          </Text>
          <Text className="text-gray-400 text-sm">
            Pick your scene so we can show you the best of the {"\n"}best only.
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <TouchableOpacity
                key={interest}
                className={`px-3 py-2 rounded-full border ${
                  selectedInterests.includes(interest)
                    ? "bg-primary/10 border-primary"
                    : "bg-gray-50 dark:bg-dark-seconndary/50 border-gray-200 dark:border-dark-seconndary"
                }`}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  className={`text-xs ${
                    selectedInterests.includes(interest)
                      ? "text-primary"
                      : "text-black dark:text-white"
                  }`}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="flex-row items-center gap-x-2">
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

export default BoardingStep2;
