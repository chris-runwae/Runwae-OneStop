import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function AuthButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
  textStyle,
}: AuthButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled
            ? colors.textColors.subtle
            : colors.primaryColors.default,
        };
      case 'secondary':
        return {
          backgroundColor: colors.backgroundColors.subtle,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.borderColors.default,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {};
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return {
          color: '#ffffff',
        };
      case 'secondary':
      case 'outline':
      case 'ghost':
        return {
          color: colors.textColors.default,
        };
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' ? colors.white : colors.primaryColors.default
          }
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              textStyles.button,
              getTextStyle(),
              icon ? styles.textWithIcon : undefined,
              textStyle,
            ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 52,
  },
  text: {
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: 10,
  },
});
