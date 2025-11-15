import { Check } from 'lucide-react-native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';

import { CustomImage, Text } from '@/components';
import { useColorScheme } from '@/hooks';
import { COLORS, Colors } from '@/constants';

export const FeatureCard = ({
  icon,
  feature,
  index,
}: {
  icon: string;
  feature: string;
  index: number;
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    animatedValue.value = withTiming(1, { duration: 400 + index * 100 });
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
      style={[
        animatedStyle,
        styles.featureCard,
        {
          backgroundColor: isDarkMode ? COLORS.gray[900] : 'rgba(0,0,0,0.03)',
        },
      ]}>
      <Text style={styles.featureCardIcon}>{icon}</Text>
      <Text
        style={[
          styles.featureCardText,
          {
            color: isDarkMode ? COLORS.white.base : COLORS.gray[900],
          },
        ]}>
        {feature}
      </Text>
    </Animated.View>
  );
};

interface CustomImageBackgroundProps {
  source: { uri: string };
  style?: any;
  children: React.ReactNode;
}

export const CustomImageBackground: React.FC<CustomImageBackgroundProps> = ({
  source,
  style,
  children,
}) => {
  return (
    <View style={[styles.imageBackground, style]}>
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
}: {
  option: any;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  isDarkMode?: boolean;
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    animatedValue.value = withTiming(1, { duration: 400 + index * 100 });
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
        style={[
          styles.animatedOption,
          {
            transform: [{ scale: isSelected ? 1.02 : 1 }],
            backgroundColor: isSelected
              ? colors.primaryColors.background
              : colors.backgroundColors.default,
            borderColor: isSelected
              ? colors.primaryColors.default
              : colors.borderColors.subtle,
          },
        ]}>
        <Text style={styles.animatedOptionIcon}>{option.icon}</Text>
        <Text
          style={[
            styles.animatedOptionText,
            {
              color: isSelected
                ? colors.primaryColors.default
                : colors.textColors.default,
              fontWeight: isSelected ? '600' : 'normal',
            },
          ]}>
          {option.text}
        </Text>
        {isSelected && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[
              styles.animatedOptionCheck,
              { backgroundColor: colors.primaryColors.default },
            ]}>
            <Check size={16} color="white" />
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const PillOption = ({
  option,
  index,
  isSelected,
  onSelect,
  isDarkMode,
}: {
  option: any;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  isDarkMode?: boolean;
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    animatedValue.value = withTiming(1, { duration: 400 + index * 50 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedValue.value,
      transform: [
        { translateY: interpolate(animatedValue.value, [0, 1], [15, 0]) },
      ],
    };
  });

  return (
    <Animated.View style={[animatedStyle, styles.pillOptionContainer]}>
      <TouchableOpacity
        onPress={onSelect}
        style={[
          styles.pillOption,
          {
            backgroundColor: isSelected
              ? colors.primaryColors.default
              : colors.backgroundColors.subtle,
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected
              ? colors.primaryColors.default
              : colors.borderColors.subtle,
            transform: [{ scale: isSelected ? 1.02 : 1 }],
          },
        ]}>
        <Text style={styles.pillOptionIcon}>{option.icon}</Text>
        <Text
          style={[
            styles.pillOptionText,
            {
              color: isSelected ? colors.white : colors.textColors.default,
            },
          ]}>
          {option.text}
        </Text>
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
      style={[animatedStyle, marginRight && styles.animatedFeatureIconMargin]}>
      <View style={styles.animatedFeatureIconContainer}>
        {icon}
        <Text style={styles.animatedFeatureIconLabel}>{label}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    position: 'relative',
  },
  featureCard: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
  },
  featureCardIcon: {
    marginRight: 12,
    fontSize: 20,
  },
  featureCardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  animatedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  animatedOptionIcon: {
    marginRight: 12,
    fontSize: 24,
  },
  animatedOptionText: {
    flex: 1,
    fontSize: 18,
  },
  animatedOptionCheck: {
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  pillOptionContainer: {
    marginBottom: 8,
    marginRight: 8,
  },
  pillOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillOptionIcon: {
    marginRight: 6,
    fontSize: 16,
  },
  pillOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  animatedFeatureIconMargin: {
    marginRight: 12,
  },
  animatedFeatureIconContainer: {
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
  },
  animatedFeatureIconLabel: {
    marginTop: 4,
    fontSize: 12,
    color: 'white',
  },
});
