import { RelativePathString, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useUser } from '@clerk/clerk-expo';

import {
  DestinationSlide,
  DateSlide,
  PersonalizationSlide,
} from '@/components/trip-creation/TripCreationSlides';
import { tripCreationData } from '@/components/trip-creation/tripCreationData';
import { Colors, COLORS } from '@/constants';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScreenContainer, Spacer } from '@/components';
import { useTrips } from '@/hooks';

const { width } = Dimensions.get('window');

export default function TripCreationScreen() {
  const { createTrip } = useTrips();
  const { user } = useUser();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const isDarkMode = colorScheme === 'dark';
  const scrollRef = useRef<ScrollView>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = tripCreationData.length;

  const slideAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const buttonAnimation = useSharedValue(0);

  const [tripData, setTripData] = useState<Record<string, any>>({
    destination: '',
    startDate: null,
    endDate: null,
    name: '',
    description: '',
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
    // Ensure minimum width of 10% so the bar is always visible
    const progressPercentage = Math.max(10, progressAnimation.value * 100);
    return {
      width: `${progressPercentage}%`,
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
    setTripData((prev) => ({ ...prev, [key]: value }));
  };

  const isCurrentStepValid = () => {
    switch (currentSlide.type) {
      case 'destination':
        return tripData.destination && tripData.destination.trim().length > 0;
      case 'dates':
        console.log('tripData.startDate: ', tripData);
        return tripData.startDate && tripData.endDate;
      case 'personalization':
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

  const handleSaveTrip = async () => {
    // TODO: Implement actual trip saving logic
    const trip = await createTrip({
      user_id: user?.id,
      start_date: tripData.startDate,
      end_date: tripData.endDate,
      description: tripData.description,
      title: tripData.name,
      cover_image_url: tripData.headerImage ?? 'https://placehold.co/600x400',
      destination: tripData.destination,
    });

    console.log('Saving trip:', JSON.stringify(trip, null, 2));
    // Navigate back to trips screen
    router.replace('/(tabs)/trips' as RelativePathString);
  };

  const renderSlide = () => {
    const slide = tripCreationData[currentStep];

    switch (slide.type) {
      case 'destination':
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
      case 'dates':
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
      case 'personalization':
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
      return 'Save Trip';
    }
    return 'Continue';
  };

  return (
    <ScreenContainer
      header={{
        leftComponent: (
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={24} color={colors.textColors.default} />
          </TouchableOpacity>
        ),
        // rightComponent: (

        // ),
      }}
      className="flex-1">
      <Spacer size={16} vertical />
      {/* Progress Bar */}
      <View className="mb-4 items-center justify-center rounded-full px-6">
        <View
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : COLORS.gray[350],
            borderRadius: 100,
            overflow: 'hidden',
          }}>
          <Animated.View
            className="h-full rounded-full"
            style={[
              progressStyle,
              {
                backgroundColor: colors.primaryColors.default,
                height: 16,
                overflow: 'hidden',
              },
            ]}
          />
        </View>
      </View>
      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        className="flex-1">
        {renderSlide()}
      </ScrollView>

      {/* Continue/Save Button */}
      <View className="mb-10 items-center gap-y-4 px-6">
        <Animated.View style={[buttonAnimStyle, { width: '100%' }]}>
          <TouchableOpacity
            onPress={handleNext}
            className="w-full flex-row items-center justify-center rounded-xl py-4"
            style={{
              backgroundColor: isCurrentStepValid()
                ? colors.primaryColors.default
                : COLORS.gray[350],
              opacity: isCurrentStepValid() ? 1 : 0.7,
            }}
            disabled={!isCurrentStepValid()}>
            <Text
              className="mr-2 text-lg font-semibold text-white"
              style={{ color: COLORS.white.base }}>
              {getButtonText()}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Spacer size={60} vertical />
    </ScreenContainer>
  );
}
