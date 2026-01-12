import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  useColorScheme,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function AuthInput({
  label,
  error,
  isPassword = false,
  ...props
}: AuthInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, textStyles.label, { color: colors.text }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.borderColors.subtle,
            borderColor: error
              ? colors.destructiveColors.default
              : colors.borderColors.default,
          },
        ]}>
        <TextInput
          style={[
            styles.input,
            textStyles.body,
            { color: colors.textColors.default },
          ]}
          placeholderTextColor={colors.textColors.subtitle}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {showPassword ? (
              <EyeOff size={20} color={colors.textColors.subtitle} />
            ) : (
              <Eye size={20} color={colors.textColors.subtitle} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={[
            styles.error,
            textStyles.caption,
            { color: colors.destructiveColors.default },
          ]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
  },
  eyeButton: {
    padding: 4,
  },
  error: {
    marginTop: 6,
  },
});
