import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import {
  WelcomeSlide,
  ChoiceSlide,
  FeaturesSlide,
} from '@/components/onboarding/OnboardingSlides';
import { surveyData } from '@/components/onboarding/surveyData';
import { Colors } from '@/constants';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme ?? 'light'];
  const isDarkMode = colorScheme === 'dark';
  const scrollRef = useRef<ScrollView>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = surveyData.length;

  const slideAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const buttonAnimation = useSharedValue(0);

  const [responses, setResponses] = useState<Record<string, any>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const currentSlide = surveyData[currentStep];

  React.useEffect(() => {
    progressAnimation.value = withSpring(currentStep / (totalSteps - 1));

    slideAnimation.value = withTiming(1, { duration: 300 });

    buttonAnimation.value = withTiming(1, { duration: 400 });

    return () => {
      slideAnimation.value = 0;
      buttonAnimation.value = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleNext = () => {
    const processCurrentStepResponses = () => {
      if (
        currentSlide.type === 'multiple-choice' &&
        selectedOptions.length > 0
      ) {
        const value = selectedOptions[0];
        setResponses({ ...responses, [currentSlide.id]: value });

        if (currentSlide.id === 'plant-experience') {
        } else if (currentSlide.id === 'goals') {
        } else if (currentSlide.id === 'frequency') {
        }
      } else if (
        currentSlide.type === 'multiple-select' &&
        selectedOptions.length > 0
      ) {
        setResponses({ ...responses, [currentSlide.id]: [...selectedOptions] });

        if (currentSlide.id === 'plant-types') {
        }
      }
    };

    slideAnimation.value = 0;

    processCurrentStepResponses();

    if (currentStep === totalSteps - 1) {
    } else {
      setCurrentStep(currentStep + 1);
      setSelectedOptions([]);
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

      const prevSlide = surveyData[currentStep - 1];
      if (prevSlide.type === 'multiple-choice' && responses[prevSlide.id]) {
        setSelectedOptions([responses[prevSlide.id]]);
      } else if (
        prevSlide.type === 'multiple-select' &&
        responses[prevSlide.id]
      ) {
        setSelectedOptions(responses[prevSlide.id]);
      } else {
        setSelectedOptions([]);
      }
    }
  };

  const handleSkip = () => {};

  const handleOptionSelect = (optionId: string) => {
    if (currentSlide.type === 'multiple-choice') {
      setSelectedOptions([optionId]);
    } else if (currentSlide.type === 'multiple-select') {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    }
  };

  const renderSlide = () => {
    const slide = surveyData[currentStep];

    switch (slide.type) {
      case 'welcome':
        return (
          <WelcomeSlide
            slide={slide}
            slideAnimation={slideAnimation}
            selectedOptions={selectedOptions}
            handleOptionSelect={handleOptionSelect}
            handleNext={handleNext}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        );
      case 'multiple-choice':
      case 'multiple-select':
        return (
          <ChoiceSlide
            slide={slide}
            slideAnimation={slideAnimation}
            selectedOptions={selectedOptions}
            handleOptionSelect={handleOptionSelect}
            handleNext={handleNext}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        );
      case 'features':
        return (
          <FeaturesSlide
            slide={slide}
            slideAnimation={slideAnimation}
            selectedOptions={selectedOptions}
            handleOptionSelect={handleOptionSelect}
            handleNext={handleNext}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: isDarkMode
          ? '#121212'
          : colors.backgroundColors.subtle,
      }}>
      {currentStep > 0 && (
        <View className="flex-row items-center justify-between px-6 pb-4 pt-16">
          <TouchableOpacity
            onPress={handleBack}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDarkMode
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.05)',
            }}>
            <ChevronLeft size={24} color={colors.textColors.subtitle} />
          </TouchableOpacity>

          <View
            className="mx-3 h-2 flex-1 overflow-hidden rounded-full"
            style={{
              backgroundColor: isDarkMode
                ? '#222222'
                : colors.borderColors.subtle,
            }}>
            <Animated.View
              className="h-full rounded-full"
              style={[
                progressStyle,
                { backgroundColor: colors.primaryColors.default },
              ]}
            />
          </View>

          <TouchableOpacity onPress={handleSkip}>
            <Text
              style={{ color: colors.primary[500] }}
              className="text-base font-medium">
              Skip
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        className="flex-1">
        {renderSlide()}
      </ScrollView>

      {currentStep > 0 && (
        <View className="mb-10 items-center px-6">
          {currentStep === 0 ? null : currentStep === totalSteps - 1 ? (
            <Animated.View style={[buttonAnimStyle, { width: '100%' }]}>
              <TouchableOpacity
                onPress={() => {}}
                className="w-full items-center justify-center rounded-xl py-4"
                style={{ backgroundColor: colors.primary[500] }}>
                <Text className="text-lg font-semibold text-white">
                  Continue to Premium
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View style={[buttonAnimStyle, { width: '100%' }]}>
              <TouchableOpacity
                onPress={handleNext}
                className="w-full flex-row items-center justify-center rounded-xl py-4"
                style={{
                  backgroundColor:
                    selectedOptions.length > 0
                      ? colors.primary[500]
                      : colors.borderColors.subtle,
                  opacity: selectedOptions.length > 0 ? 1 : 0.7,
                }}
                disabled={
                  (currentSlide.type === 'multiple-choice' ||
                    currentSlide.type === 'multiple-select') &&
                  selectedOptions.length === 0
                }>
                <Text className="mr-2 text-lg font-semibold text-white">
                  Continue
                </Text>
                <ChevronRight size={20} color="white" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
}
