import { ArrowRight, Compass, Users, Calendar } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

import {
  AnimatedFeatureIcon,
  AnimatedOption,
  CustomImageBackground,
  FeatureCard,
  PillOption,
} from './OnboardingComponents';
import { useColorScheme } from '@/hooks';

import { Colors, COLORS } from '@/constants';

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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={{ width, flex: 1 }}>
      <CustomImageBackground
        source={{ uri: slide.image || '' }}
        style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View style={[slideAnimStyle, { padding: 8, paddingTop: 16 }]}>
          <Text className="mb-3 text-5xl font-bold text-white">
            {slide.title}
          </Text>
          <Text className="mb-10 text-lg text-white/90">
            {slide.description}
          </Text>
          <View className="mb-8 flex-row items-center justify-between">
            <View className="flex-row ">
              <AnimatedFeatureIcon
                icon={<Compass size={24} color="white" />}
                label="Create"
                index={0}
                marginRight
              />
              <AnimatedFeatureIcon
                icon={<Calendar size={24} color="white" />}
                label="Events"
                index={1}
                marginRight
              />
              <AnimatedFeatureIcon
                icon={<Users size={24} color="white" />}
                label="Groups"
                index={2}
              />
            </View>
            <TouchableOpacity
              onPress={handleNext}
              className="bottom-0 right-0 h-16 w-16 flex-row items-center justify-center rounded-full"
              style={{ backgroundColor: colors.primaryColors.default }}>
              <ArrowRight size={20} color={colors.white} />
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
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
    <View style={{ width, flex: 1, padding: 16, paddingTop: 24 }}>
      <Animated.View style={[slideAnimStyle, { flex: 1 }]}>
        <Text
          style={{
            color: colors.textColors.default,
            fontWeight: 'bold',
            fontSize: 24,
            marginBottom: 6,
          }}>
          {slide.question}
        </Text>

        {slide.description && (
          <Text
            style={{
              color: colors.textColors.subtle,
              fontSize: 16,
              marginBottom: 8,
            }}>
            {slide.description}
          </Text>
        )}

        <View style={{ gap: 12 }}>
          {slide.options?.map((option: Option, index: number) => {
            const isSelected = selectedOptions.includes(option.id);
            return (
              <AnimatedOption
                key={option.id}
                option={option}
                index={index}
                isSelected={isSelected}
                onSelect={() => handleOptionSelect(option.id)}
              />
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

export const EventPreferencesSlide: React.FC<SlideProps> = ({
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
    <View style={{ width, flex: 1, padding: 16, paddingTop: 24 }}>
      <Animated.View style={[slideAnimStyle, { flex: 1 }]}>
        <Text
          style={{
            color: colors.textColors.default,
            fontWeight: 'bold',
            fontSize: 24,
            marginBottom: 6,
          }}>
          {slide.question}
        </Text>

        {slide.description && (
          <Text
            style={{
              color: colors.textColors.subtle,
              fontSize: 16,
              marginBottom: 8,
            }}>
            {slide.description}
          </Text>
        )}

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {slide.options?.map((option: Option, index: number) => {
              const isSelected = selectedOptions.includes(option.id);
              return (
                <PillOption
                  key={option.id}
                  option={option}
                  index={index}
                  isSelected={isSelected}
                  onSelect={() => handleOptionSelect(option.id)}
                  isDarkMode={isDarkMode}
                />
              );
            })}
          </View>
        </ScrollView>
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
    <View style={{ width, flex: 1, padding: 16, paddingTop: 24 }}>
      <Animated.View style={[slideAnimStyle, { flex: 1 }]}>
        <Text
          style={{
            color: colors.textColors.default,
            fontWeight: 'bold',
            fontSize: 24,
            marginBottom: 6,
          }}>
          {slide.title}
        </Text>
        <Text
          style={{
            color: colors.textColors.subtle,
            fontSize: 16,
            marginBottom: 8,
          }}>
          {slide.description}
        </Text>

        <View style={{ marginBottom: 24 }}>
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
