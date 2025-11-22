import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  View,
  ViewStyle,
  TextStyle,
  Pressable,
  useColorScheme,
  StyleSheet,
} from 'react-native';

import { Text } from '@/components';
import { Colors } from '@/constants';

type ButtonVariant = 'filled' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  outlineColor?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  size = 'md',
  children,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  outlineColor,
  leftIcon,
}) => {
  const colorScheme = useColorScheme() ?? 'light';

  const sizeStyle: Record<
    ButtonSize,
    { height: number; fontSize: number; padding: number }
  > = {
    sm: { height: 32, fontSize: 12, padding: 8 },
    md: { height: 40, fontSize: 14, padding: 12 },
    lg: { height: 48, fontSize: 16, padding: 16 },
  };

  const getVariantStyle = (variant: ButtonVariant) => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      paddingHorizontal: sizeStyle[size].padding,
      height: sizeStyle[size].height,
      opacity: disabled ? 0.5 : 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: leftIcon ? 'flex-start' : 'center',

      ...Platform.select({
        web: {
          maxWidth: 320,
        },
      }),
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: disabled
            ? Colors[colorScheme].borderColors.default
            : Colors[colorScheme].pink500,
          borderWidth: 0,
        };
      case 'outline':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: disabled
            ? Colors[colorScheme].borderColors.default
            : outlineColor
              ? outlineColor
              : Colors[colorScheme].borderColors.default,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
    }
  };

  const getTextStyle = (variant: ButtonVariant) => {
    const baseStyle: TextStyle = {
      fontSize: sizeStyle[size].fontSize,
      fontWeight: 'bold',
    };
    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          color: Colors[colorScheme].background,
        };
      case 'outline':
        return {
          ...baseStyle,
          color: Colors[colorScheme].text,
        };
      case 'ghost':
        return {
          ...baseStyle,
          color: disabled
            ? Colors[colorScheme].borderColors.default
            : Colors[colorScheme].text,
        };
    }
  };

  return (
    <Pressable
      style={StyleSheet.flatten([getVariantStyle(variant), style])}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            textStyle?.color ||
            (variant === 'filled'
              ? Colors[colorScheme].background
              : Colors[colorScheme].text)
          }
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && (
            <>
              <Ionicons
                name={leftIcon}
                size={sizeStyle[size].fontSize + 2}
                color={
                  textStyle?.color ||
                  (variant === 'filled'
                    ? Colors[colorScheme].background
                    : Colors[colorScheme].text)
                }
              />
              <View style={{ width: 8 }} />
            </>
          )}
          <Text style={StyleSheet.flatten([getTextStyle(variant), textStyle])}>
            {children}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
