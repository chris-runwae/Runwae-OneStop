// import { Leaf } from 'lucide-react-native';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { Colors, COLORS } from '@/constants';
import { useColorScheme } from '@/hooks/use-color-scheme';

const LogoDark = require('@/assets/images/figma/4.png');
const LogoLight = require('@/assets/images/icon.png');

export default function SplashScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDarkMode = colorScheme === 'dark';

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const logoStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    scale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    });
  }, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#121212' : colors.background },
      ]}>
      <Animated.View style={[logoStyle]}>
        <View style={styles.logoContainer}>
          <Image
            source={isDarkMode ? LogoDark : LogoLight}
            style={{
              width: 192,
              height: 192,
            }}
            contentFit="contain"
          />
        </View>
      </Animated.View>

      <Animated.Text
        style={[
          logoStyle,
          styles.title,
          {
            color: isDarkMode ? COLORS.white.base : '#B45309',
          },
        ]}>
        Runwae
      </Animated.Text>

      <Animated.Text
        style={[
          logoStyle,
          styles.subtitle,
          {
            color: isDarkMode ? COLORS.gray[400] : COLORS.gray[600],
          },
        ]}>
        Plan and share group trips with friends and family.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    borderRadius: 16,
    padding: 20,
  },
  title: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 8,
    paddingHorizontal: 24,
    textAlign: 'center',
    fontSize: 14,
  },
});
