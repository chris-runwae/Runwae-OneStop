import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import CustomTextInput from '@/components/ui/custome-input';
import { COLORS } from '@/constants';

interface TripFormFieldsProps {
  name: string;
  description: string;
  nameError?: string;
  descriptionError?: string;
  onNameChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  isDarkMode: boolean;
}

export const TripFormFields: React.FC<TripFormFieldsProps> = ({
  name,
  description,
  nameError,
  descriptionError,
  onNameChange,
  onDescriptionChange,
  isDarkMode,
}) => {
  const placeholderColor = isDarkMode ? COLORS.gray[500] : COLORS.gray[400];
  const labelColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const inputBg = isDarkMode ? 'bg-[#F8F9FA]/10' : 'bg-[#F8F9FA]';

  return (
    <>
      <View className="mb-6">
        <CustomTextInput
          label="Trip Title"
          placeholder="My trip"
          value={name}
          onChangeText={onNameChange}
          error={nameError}
          placeholderTextColor={placeholderColor}
          labelStyle={`mb-3 text-base font-semibold ${labelColor}`}
          className={`${inputBg} rounded-xl px-4 py-3 text-base`}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="mb-6 flex-1">
        <View className="mb-3 flex-row items-center">
          <Text className={`text-base font-semibold ${labelColor}`}>
            Description{' '}
          </Text>
          <Text
            className="text-sm"
            style={{ color: isDarkMode ? COLORS.gray[500] : COLORS.gray[400] }}>
            (Optional)
          </Text>
        </View>
        <CustomTextInput
          placeholder="Describe your trip..."
          value={description}
          onChangeText={onDescriptionChange}
          error={descriptionError}
          textarea
          placeholderTextColor={placeholderColor}
          className={`${inputBg} min-h-24 rounded-xl px-4 py-3 text-base`}
        />
      </KeyboardAvoidingView>
    </>
  );
};
