import { router } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";

import {
  DestinationSlide,
  DateSlide,
  PersonalizationSlide,
} from "@/components/trip-creation/TripCreationSlides";
import { tripCreationData } from "@/components/trip-creation/tripCreationData";
import { Colors, COLORS } from "@/constants";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ScreenContainer } from "@/components";

const { width } = Dimensions.get("window");

export default function TripCreationScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = Colors[colorScheme];
  const isDarkMode = colorScheme === "dark";
  const scrollRef = useRef<ScrollView>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = tripCreationData.length;

  const slideAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const buttonAnimation = useSharedValue(0);

  const [tripData, setTripData] = useState<Record<string, any>>({
    destination: "",
    startDate: null,
    endDate: null,
    name: "",
    description: "",
    headerImage: null,
  });

  const currentSlide = tripCreationData[currentStep];

  React.useEffect(() => {
    progressAnimation.value = withSpring(currentStep / (totalSteps - 1));

    slideAnimation.value = withTiming(1, { duration: 300 });

    buttonAnimation.value = withTiming(1, { duration: 400 });

    return () => {
      slideAnimation.value = 0;
      buttonAnimation.value = 0;
    };
  }, [currentStep]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnimation.value * 100}%`,
    };
  });

  const buttonAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonAnimation.value,
      transform: [
        { translateY: interpolate(buttonAnimation.value, [0, 1], [10, 0]) },
      ],
    };
  });

  const handleUpdateData = (key: string, value: any) => {
    setTripData({ ...tripData, [key]: value });
  };

  const isCurrentStepValid = () => {
    switch (currentSlide.type) {
      case "destination":
        return tripData.destination && tripData.destination.trim().length > 0;
      case "dates":
        return tripData.startDate && tripData.endDate;
      case "personalization":
        return tripData.name && tripData.name.trim().length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!isCurrentStepValid()) return;

    slideAnimation.value = 0;

    if (currentStep === totalSteps - 1) {
      // Handle trip creation/save
      handleSaveTrip();
    } else {
      setCurrentStep(currentStep + 1);
      scrollRef.current?.scrollTo({
        x: width * (currentStep + 1),
        animated: true,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      slideAnimation.value = 0;

      setCurrentStep(currentStep - 1);
      scrollRef.current?.scrollTo({
        x: width * (currentStep - 1),
        animated: true,
      });
    } else {
      // Go back to previous screen
      router.back();
    }
  };

  const handleSaveTrip = () => {
    // TODO: Implement actual trip saving logic
    console.log("Saving trip:", tripData);

    // Navigate back to trips screen
    router.back();
  };

  const renderSlide = () => {
    const slide = tripCreationData[currentStep];

    switch (slide.type) {
      case "destination":
        return (
          <DestinationSlide
            slide={slide}
            slideAnimation={slideAnimation}
            tripData={tripData}
            onUpdateData={handleUpdateData}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        );
      case "dates":
        return (
          <DateSlide
            slide={slide}
            slideAnimation={slideAnimation}
            tripData={tripData}
            onUpdateData={handleUpdateData}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        );
      case "personalization":
        return (
          <PersonalizationSlide
            slide={slide}
            slideAnimation={slideAnimation}
            tripData={tripData}
            onUpdateData={handleUpdateData}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        );
      default:
        return null;
    }
  };

  const getButtonText = () => {
    if (currentStep === totalSteps - 1) {
      return "Save Trip";
    }
    return "Continue";
  };

  return (
    <ScreenContainer
      header={{
        leftComponent: (
          <TouchableOpacity onPress={handleBack}>
            <ChevronLeft
              size={24}
              color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]}
            />
          </TouchableOpacity>
        ),
      }}
    >
      {/* Header with back button and progress */}
      <View className="flex-row items-center justify-between px-6 pb-4 pt-16">
        <View
          className="mx-3 h-2 flex-1 overflow-hidden rounded-full"
          style={{
            backgroundColor: isDarkMode ? "#222222" : COLORS.gray[350],
          }}
        >
          <Animated.View
            className="h-full rounded-full"
            style={[
              progressStyle,
              { backgroundColor: colors.primaryColors.default },
            ]}
          />
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        className="flex-1"
      >
        {renderSlide()}
      </ScrollView>

      {/* Continue/Save Button */}
      <View className="mb-10 items-center gap-y-4 px-6">
        <Animated.View style={[buttonAnimStyle, { width: "100%" }]}>
          <TouchableOpacity
            onPress={handleNext}
            className="w-full flex-row items-center justify-center rounded-xl py-4"
            style={{
              backgroundColor: isCurrentStepValid()
                ? colors.primaryColors.default
                : COLORS.gray[350],
              opacity: isCurrentStepValid() ? 1 : 0.7,
            }}
            disabled={!isCurrentStepValid()}
          >
            <Text className="mr-2 text-lg font-semibold text-white">
              {getButtonText()}
            </Text>
            {currentStep < totalSteps - 1 && (
              <ChevronRight size={20} color="white" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
