import React from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { ArrowRight, Map, Users, Sparkles } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

import Text from '@/components/ui/Text';
import { AppFonts } from '@/constants';
import {
  AnimatedFeatureIcon,
  AnimatedOption,
  CustomImageBackground,
  FeatureCard,
} from './OnboardingComponents';

const { width } = Dimensions.get('window');

interface SlideProps {
  slide: any;
  slideAnimation: any;
  selectedOptions: string[];
  handleOptionSelect: (optionId: string) => void;
  handleNext: () => void;
  colors: any;
  isDarkMode: boolean;
}

interface Option {
  id: string;
  text: string;
  icon: string;
}

interface Feature {
  text: string;
  icon: string;
}

export const WelcomeSlide: React.FC<SlideProps> = ({
  slide,
  slideAnimation,
  handleNext,
  colors,
}) => {
  const slideAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: slideAnimation.value,
      transform: [
        {
          translateX: interpolate(
            slideAnimation.value,
            [0, 1],
            [width * 0.1, 0]
          ),
        },
      ],
    };
  });

  return (
    <View style={{ width }} className="flex-1">
      <CustomImageBackground
        source={{ uri: slide.image || '' }}
        className="flex-1 justify-end">
        <Animated.View
          style={[slideAnimStyle]}
          className="py-200 flex-1 justify-end bg-black/40 p-8">
          <Text
            replaceDefaultStyle
            className="mb-3 text-5xl font-bold text-white"
            style={{ fontFamily: AppFonts.bricolage.bold }}>
            {slide.title}
          </Text>
          <Text
            replaceDefaultStyle
            className="mb-10 text-lg text-white/90"
            style={{ fontFamily: AppFonts.inter.regular }}>
            {slide.description}
          </Text>
          <View className="mb-8 flex-row items-center justify-between">
            <View className="flex-row ">
              <AnimatedFeatureIcon
                icon={<Map size={24} color="white" />}
                label="Plan"
                index={0}
                marginRight={true}
              />
              <AnimatedFeatureIcon
                icon={<Users size={24} color="white" />}
                label="Group"
                index={1}
                marginRight={true}
              />
              <AnimatedFeatureIcon
                icon={<Sparkles size={24} color="white" />}
                label="Book"
                index={2}
              />
            </View>
            <TouchableOpacity
              onPress={handleNext}
              className="bottom-0 right-0 h-16 w-16 flex-row items-center justify-center rounded-full"
              style={{ backgroundColor: colors.primaryColors.default }}>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </CustomImageBackground>
    </View>
  );
};

export const ChoiceSlide: React.FC<SlideProps> = ({
  slide,
  slideAnimation,
  selectedOptions,
  handleOptionSelect,
  colors,
  isDarkMode,
}) => {
  const slideAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: slideAnimation.value,
      transform: [
        {
          translateX: interpolate(
            slideAnimation.value,
            [0, 1],
            [width * 0.1, 0]
          ),
        },
      ],
    };
  });

  return (
    <View style={{ width }} className="flex-1 px-6 pt-6">
      <Animated.View style={[slideAnimStyle]} className="flex-1">
        <Text
          className="mb-6 text-2xl font-bold"
          style={{ color: isDarkMode ? colors.white : colors.gray[900] }}>
          {slide.question}
        </Text>

        {slide.description && (
          <Text
            className="mb-6 text-base"
            style={{
              color: isDarkMode ? colors.gray[400] : colors.gray[600],
            }}>
            {slide.description}
          </Text>
        )}

        <View className="gap-y-3">
          {slide.options?.map((option: Option, index: number) => {
            const isSelected = selectedOptions.includes(option.id);
            return (
              <AnimatedOption
                key={option.id}
                option={option}
                index={index}
                isSelected={isSelected}
                onSelect={() => handleOptionSelect(option.id)}
                isDarkMode={isDarkMode}
                colors={colors}
              />
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

export const FeaturesSlide: React.FC<SlideProps> = ({
  slide,
  slideAnimation,
  colors,
  isDarkMode,
}) => {
  const slideAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: slideAnimation.value,
      transform: [
        {
          translateX: interpolate(
            slideAnimation.value,
            [0, 1],
            [width * 0.1, 0]
          ),
        },
      ],
    };
  });

  return (
    <View style={{ width }} className="flex-1 px-6 pt-6">
      <Animated.View style={[slideAnimStyle]} className="flex-1">
        <Text
          className="mb-3 text-3xl font-bold"
          style={{ color: isDarkMode ? colors.white : colors.gray[900] }}>
          {slide.title}
        </Text>
        <Text
          className="mb-8 text-base"
          style={{
            color: isDarkMode ? colors.gray[400] : colors.gray[600],
          }}>
          {slide.description}
        </Text>

        <View className="mb-6">
          {slide.features?.map((feature: Feature, index: number) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              feature={feature.text}
              index={index}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};
