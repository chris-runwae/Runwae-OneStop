import { Colors } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

interface EditTripFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export default function EditTripField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
}: EditTripFieldProps) {
  const { dark } = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const inputStyle = [
    styles.input,
    {
      color: dark ? '#fff' : '#111827',
      backgroundColor: dark ? '#131313' : '#f8f9fa',
      borderColor: dark ? '#1f1f1f' : '#e5e7eb',
      borderWidth: 1,
    },
    multiline && styles.textArea,
  ];

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: dark ? '#9ca3af' : '#6b7280' }]}>
        {label}
      </Text>
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={dark ? '#4b5563' : '#9ca3af'}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
});
