import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import CustomImage from '@/components/ui/CustomImage';
import { Colors } from '@/constants';

export const FeatureCard = ({
  icon,
  feature,
  index,
}: {
  icon: string;
  feature: string;
  index: number;
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme ?? 'light'];
  const isDarkMode = colorScheme === 'dark';
  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    animatedValue.value = withTiming(1, { duration: 400 + index * 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedValue.value,
      transform: [
        { translateY: interpolate(animatedValue.value, [0, 1], [20, 0]) },
      ],
    };
  });

  return (
    <Animated.View
      className="mb-4 flex-row items-center rounded-xl p-3"
      style={[
        animatedStyle,
        {
          backgroundColor: isDarkMode ? '#222222' : 'rgba(0,0,0,0.03)',
        },
      ]}>
      <Text className="mr-3 text-xl">{icon}</Text>
      <Text
        className="flex-1 text-base font-medium"
        style={{
          color: isDarkMode ? colors.white : colors.textColors.default,
        }}>
        {feature}
      </Text>
    </Animated.View>
  );
};

interface CustomImageBackgroundProps {
  source: { uri: string };
  style?: any;
  className?: string;
  children: React.ReactNode;
}

export const CustomImageBackground: React.FC<CustomImageBackgroundProps> = ({
  source,
  style,
  className,
  children,
}) => {
  return (
    <View style={[styles.imageBackground, style]} className={className}>
      <CustomImage
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      {children}
    </View>
  );
};

export const AnimatedOption = ({
  option,
  index,
  isSelected,
  onSelect,
  isDarkMode,
  colors,
}: {
  option: any;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  isDarkMode: boolean;
  colors: any;
}) => {
  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    animatedValue.value = withTiming(1, { duration: 400 + index * 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedValue.value,
      transform: [
        { translateY: interpolate(animatedValue.value, [0, 1], [20, 0]) },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onSelect}
        className={`flex-row items-center rounded-xl border-2 p-4 ${
          isSelected
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
            : isDarkMode
              ? 'border-gray-800 bg-gray-900'
              : 'border-gray-200 bg-white'
        }`}
        style={{
          transform: [{ scale: isSelected ? 1.02 : 1 }],
          backgroundColor: isSelected
            ? isDarkMode
              ? 'rgba(61, 164, 80, 0.15)'
              : colors.primary[50]
            : isDarkMode
              ? '#1e1e1e'
              : colors.white,
          borderColor: isSelected
            ? colors.primary[500]
            : isDarkMode
              ? '#2c2c2c'
              : colors.gray[200],
        }}>
        <Text className="mr-3 text-2xl">{option.icon}</Text>
        <Text
          className="flex-1 text-lg"
          style={{
            color: isSelected
              ? colors.primary[500]
              : isDarkMode
                ? colors.white
                : colors.gray[900],
            fontWeight: isSelected ? '600' : 'normal',
          }}>
          {option.text}
        </Text>
        {isSelected && (
          <Animated.View
            entering={FadeIn.duration(200)}
            className="h-6 w-6 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary[500] }}>
            <Check size={16} color="white" />
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const AnimatedFeatureIcon = ({
  icon,
  label,
  index,
  marginRight = false,
}: {
  icon: React.ReactNode;
  label: string;
  index: number;
  marginRight?: boolean;
}) => {
  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    animatedValue.value = withTiming(1, { duration: 400 + index * 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedValue.value,
      transform: [
        { translateY: interpolate(animatedValue.value, [0, 1], [20, 0]) },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle} className={marginRight ? 'mr-3' : ''}>
      <View className="items-center rounded-xl bg-white/20 p-4 px-6">
        {icon}
        <Text className="mt-1 text-xs text-white">{label}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    position: 'relative',
  },
});
