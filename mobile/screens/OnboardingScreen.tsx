import { router } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native';
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
  EventPreferencesSlide,
} from '@/components/onboarding/OnboardingSlides';
import { surveyData } from '@/components/onboarding/surveyData';
import { Colors, COLORS } from '@/constants';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDarkMode = colorScheme === 'dark';
  const scrollRef = useRef<ScrollView>(null);
  const { completeOnboarding } = useOnboardingStore();

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
  }, [
    currentStep,
    totalSteps,
    progressAnimation,
    slideAnimation,
    buttonAnimation,
  ]);

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
      } else if (
        currentSlide.type === 'multiple-select' &&
        selectedOptions.length > 0
      ) {
        setResponses({ ...responses, [currentSlide.id]: [...selectedOptions] });
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

  const handleSkip = () => {
    completeOnboarding(responses);
    //this should be router.replace, made this push to test home screen animations
    router.push('/(tabs)');
  };

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
        // Use EventPreferencesSlide for event-preferences slide
        if (slide.id === 'event-preferences') {
          return (
            <EventPreferencesSlide
              slide={slide}
              slideAnimation={slideAnimation}
              selectedOptions={selectedOptions}
              handleOptionSelect={handleOptionSelect}
              handleNext={handleNext}
              colors={colors}
              isDarkMode={isDarkMode}
            />
          );
        }
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
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? '#121212'
            : colors.backgroundColors.default,
        },
      ]}>
      {currentStep > 0 && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={[
              styles.backButton,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.05)',
              },
            ]}>
            <ChevronLeft
              size={24}
              color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.progressBarContainer,
              {
                backgroundColor: isDarkMode ? '#222222' : COLORS.gray[200],
              },
            ]}>
            <Animated.View
              style={[
                styles.progressBar,
                progressStyle,
                { backgroundColor: colors.primaryColors.default },
              ]}
            />
          </View>

          <TouchableOpacity onPress={handleSkip}>
            <Text
              style={[
                styles.skipText,
                { color: colors.primaryColors.default },
              ]}>
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
        style={styles.scrollView}>
        {renderSlide()}
      </ScrollView>

      {currentStep > 0 && (
        <View style={styles.bottomContainer}>
          {currentStep === 0 ? null : currentStep === totalSteps - 1 ? (
            <>
              <Animated.View style={[buttonAnimStyle, { width: '100%' }]}>
                <TouchableOpacity
                  onPress={() => {}}
                  style={[
                    styles.button,
                    styles.fullWidthButton,
                    {
                      backgroundColor: colors.primaryColors.default,
                      opacity: 0.5,
                    },
                  ]}
                  disabled>
                  <Text style={styles.buttonText}>Continue to Premium</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* <Animated.View style={[buttonAnimStyle, { width: '100%' }]}>
                <TouchableOpacity
                  onPress={() => {}}
                  style={[
                    styles.button,
                    styles.fullWidthButton,
                    { backgroundColor: colors.primaryColors.default },
                  ]}>
                  <Text style={styles.buttonText}>Continue to Premium</Text>
                </TouchableOpacity>
              </Animated.View> */}
            </>
          ) : (
            <Animated.View style={[buttonAnimStyle, { width: '100%' }]}>
              <TouchableOpacity
                onPress={handleNext}
                style={[
                  styles.button,
                  styles.fullWidthButton,
                  styles.buttonRow,
                  {
                    backgroundColor:
                      selectedOptions.length > 0
                        ? colors.primaryColors.default
                        : colors.primaryColors.default,
                    opacity: selectedOptions.length > 0 ? 1 : 0.1,
                  },
                ]}
                disabled={
                  (currentSlide.type === 'multiple-choice' ||
                    currentSlide.type === 'multiple-select') &&
                  selectedOptions.length === 0
                }>
                <Text
                  style={[
                    styles.buttonText,
                    styles.buttonTextWithMargin,
                    // { color: colors.backgroundColors.default },
                  ]}>
                  Continue
                </Text>
                <ChevronRight
                  size={20}
                  // color={colors.backgroundColors.default}
                  color={colors.textColors.default}
                />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 64,
  },
  backButton: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  progressBarContainer: {
    marginHorizontal: 12,
    height: 8,
    flex: 1,
    overflow: 'hidden',
    borderRadius: 999,
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  bottomContainer: {
    marginBottom: 40,
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
  },
  fullWidthButton: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  buttonTextWithMargin: {
    marginRight: 8,
  },
});
