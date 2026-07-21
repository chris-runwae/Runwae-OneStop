import React, { useState, useRef, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import {
  WelcomeSlide,
  ChoiceSlide,
  FeaturesSlide,
  AuthSlide,
} from '@/components/onboarding/OnboardingSlides';
import { surveyData } from '@/components/onboarding/surveyData';
import { Colors, AppFonts } from '@/constants';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  // @ts-ignore
  const colors = Colors[colorScheme ?? 'light'];
  const isDarkMode = colorScheme === 'dark';
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<number | null>(null);

  const authSlideIndex = surveyData.findIndex((slide) => slide.type === 'auth');

  useEffect(() => {
    const checkOnboardingSeen = async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      setCurrentStep(hasSeenOnboarding !== null ? authSlideIndex : 0);
    };

    checkOnboardingSeen();
  }, []);

  const totalSteps = surveyData.length;

  const slideAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const buttonAnimation = useSharedValue(0);

  const [responses, setResponses] = useState<Record<string, any>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const currentSlide = surveyData[currentStep ?? 0];

  useEffect(() => {
    if (currentStep === null) return;

    progressAnimation.value = withSpring(currentStep / (totalSteps - 1));
    slideAnimation.value = withTiming(1, { duration: 300 });
    buttonAnimation.value = withTiming(1, { duration: 400 });

    return () => {
      slideAnimation.value = 0;
      buttonAnimation.value = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value * 100}%`,
  }));

  const buttonAnimStyle = useAnimatedStyle(() => ({
    opacity: buttonAnimation.value,
    transform: [
      { translateY: interpolate(buttonAnimation.value, [0, 1], [10, 0]) },
    ],
  }));

  const handleNext = () => {
    if (currentStep === null) return;

    if (currentStep === 0) {
      AsyncStorage.setItem('hasSeenOnboarding', 'true');
    }

    const processCurrentStepResponses = () => {
      if (
        currentSlide.type === 'multiple-choice' &&
        selectedOptions.length > 0
      ) {
        const value = selectedOptions[0];
        setResponses((prev) => ({ ...prev, [currentSlide.id]: value }));
      } else if (
        currentSlide.type === 'multiple-select' &&
        selectedOptions.length > 0
      ) {
        setResponses((prev) => ({
          ...prev,
          [currentSlide.id]: [...selectedOptions],
        }));
      }
    };

    slideAnimation.value = 0;
    processCurrentStepResponses();

    if (currentStep === totalSteps - 1) {
      // handled by handleComplete
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setSelectedOptions([]);
      scrollRef.current?.scrollTo({
        x: width * nextStep,
        animated: true,
      });
    }
  };

  const handleBack = () => {
    if (currentStep === null || currentStep <= 0) return;

    slideAnimation.value = 0;

    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    scrollRef.current?.scrollTo({
      x: width * prevStep,
      animated: true,
    });

    const prevSlide = surveyData[prevStep];
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
  };

  const handleSkip = () => {};

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // await completeOnboarding(responses);
      console.log('complete onboarding: ', JSON.stringify(responses, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (currentSlide.type === 'multiple-choice') {
      setSelectedOptions([optionId]);
    } else if (currentSlide.type === 'multiple-select') {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions((prev) => prev.filter((id) => id !== optionId));
      } else {
        setSelectedOptions((prev) => [...prev, optionId]);
      }
    }
  };

  const renderSlide = () => {
    if (currentStep === null) return null;

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
      case 'auth':
        return (
          <AuthSlide
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

  // ─── Guard: don't render until AsyncStorage check resolves ────────
  if (currentStep === null) {
    return null;
  }

  const isAuthSlide = currentSlide.type === 'auth';

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: isDarkMode
          ? '#121212'
          : colors.backgroundColors.subtle,
        paddingTop: insets.top + 16,
      }}>
      {/* Progress bar — hidden on welcome (0) and auth (1) slides */}
      {currentStep > 1 && (
        <View className="flex-row items-center justify-between gap-x-4 px-6 pb-4 pt-16">
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
              style={{ color: colors.textColors.default }}
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

      {/* Continue button — hidden on welcome and auth slides */}
      {currentStep > 1 && !isAuthSlide && (
        <View className="mb-10 items-center px-6">
          {currentStep === totalSteps - 1 ? (
            <Animated.View style={[buttonAnimStyle, { width: '100%' }]}>
              <TouchableOpacity
                onPress={handleComplete}
                className="w-full items-center justify-center rounded-xl py-4"
                style={{ backgroundColor: colors.primaryColors.default }}>
                <Text
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: AppFonts.inter.semiBold }}>
                  Let&apos;s plan some trips!
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
                      ? colors.primaryColors.default
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
