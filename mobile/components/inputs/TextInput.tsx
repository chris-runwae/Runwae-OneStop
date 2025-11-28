import React, { useState } from 'react';
import {
  Platform,
  View,
  ViewStyle,
  TextStyle,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  // useColorScheme,
  StyleSheet,
} from 'react-native';

import { Text } from '@/components';
import { Colors } from '@/constants';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { textStyles } from '@/utils/styles';

type InputVariant = 'default' | 'filled' | 'outline' | 'ghost';
type InputSize = 'sm' | 'md' | 'lg';

interface TextInputProps extends RNTextInputProps {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelColor?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  variant = 'default',
  size = 'md',
  disabled = false,
  containerStyle,
  inputStyle,
  labelColor,
  ...props
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [isFocused, setIsFocused] = useState(false);
  // const focused = ;

  const sizeStyle: Record<
    InputSize,
    { height?: number; fontSize: number; padding: number }
  > = {
    sm: { fontSize: 16, padding: 8 },
    md: { height: 50, fontSize: 16, padding: 14 },
    lg: { height: 55, fontSize: 32, padding: 16 },
  };

  const getVariantStyle = (variant: InputVariant) => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      backgroundColor: colors.borderColors.subtle,

      paddingHorizontal: sizeStyle[size].padding,
      height: sizeStyle[size].height,
      opacity: disabled ? 0.5 : 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
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
          backgroundColor: colors.primaryColors.default,
          borderWidth: 0,
        };
      case 'outline':
        return {
          ...baseStyle,
          borderWidth: isFocused ? 2 : 1,
          backgroundColor: 'transparent',
          borderColor: colors.borderColors.default,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return colors.borderColors.default;
    }
    return colors.textColors.default;
  };

  const textInputStyle = {
    height: sizeStyle[size].height,
    fontSize: sizeStyle[size].fontSize,
    padding: sizeStyle[size].padding,
    color: getTextColor(),
    width: '100%' as const,
  };

  // TODO: Add error style that will use dark or light mode
  // const errorStyle = {
  //   color: 'red',
  //   fontSize: 12,
  //   marginTop: 4,
  // }

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: labelColor ?? getTextColor() }]}>
          {label}
        </Text>
      )}
      <View style={[getVariantStyle(variant), disabled && styles.disabled]}>
        <RNTextInput
          {...props}
          style={[textInputStyle, inputStyle]}
          placeholderTextColor={getTextColor()}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
  },
  label: {
    ...textStyles.bold_20,
    fontSize: 16,
  },
  input: {
    flex: 1,
    ...textStyles.bold_20,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    color: 'red',
    ...textStyles.body_Regular,
    fontSize: 12,
  },
});

export default TextInput;
