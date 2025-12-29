import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks';
import { Colors } from '@/constants';

type SkeletonProps = {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  style?: any;
};

export const Skeleton = ({
  width,
  height,
  borderRadius = 0,
  style,
}: SkeletonProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View
        style={[
          styles.skeleton,
          {
            backgroundColor: colors.backgroundColors.subtle,
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  skeleton: {
    width: '100%',
    height: '100%',
  },
});
