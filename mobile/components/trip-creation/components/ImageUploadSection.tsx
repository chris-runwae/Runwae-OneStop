import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants';
import { useUploadImage } from '@/hooks/useUploadImage';
import { textStyles } from '@/utils/styles';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

interface ImageUploadSectionProps {
  value?: string;
  onChange: (url: string) => void;
  colors: any;
  isDarkMode: boolean;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  value,
  onChange,
  colors,
  isDarkMode,
}) => {
  const { pickAndUpload } = useUploadImage();

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Sorry, we need camera roll permissions to upload images!'
          );
          return;
        }
      }

      const publicUrl = await pickAndUpload('trip-images');
      if (publicUrl) {
        onChange(publicUrl);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = () => {
    onChange('');
  };

  return (
    <View className="mt-6">
      <Text
        className="mb-3 text-base font-semibold"
        style={{ color: isDarkMode ? COLORS.white.base : COLORS.gray[750] }}>
        Header Image
      </Text>
      {value ? (
        <View className="relative">
          <Image
            source={{ uri: value }}
            style={styles.imagePreview}
            contentFit="cover"
          />
          <View className="absolute right-2 top-2 flex-row gap-2">
            <TouchableOpacity
              onPress={pickImage}
              style={styles.changeButton}
              className="rounded-full bg-black/50 px-3 py-1.5">
              <Text className="text-xs font-medium text-white">Change</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={removeImage}
              style={styles.removeButton}
              className="rounded-full bg-red-500/80 px-3 py-1.5">
              <Text className="text-xs font-medium text-white">Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={pickImage}
          className="h-[146px] w-full items-center justify-center border border-dashed"
          style={{
            borderColor: isDarkMode ? '#333333' : COLORS.gray[350],
            backgroundColor: isDarkMode ? '#1a1a1a' : COLORS.gray[350],
          }}>
          <View className="items-center">
            <Text
              style={{
                ...textStyles.regular_16,
                color: colors.primaryColors.default,
              }}>
              🖼️
            </Text>
            <Text
              className="text-center"
              style={{
                ...textStyles.regular_16,
                color: colors.primaryColors.default,
              }}>
              Tap to upload image
            </Text>
            <Text
              className="text-center"
              style={{
                ...textStyles.regular_12,
                color: isDarkMode ? COLORS.gray[500] : COLORS.gray[400],
              }}>
              png or jpg (max 800x400px)
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imagePreview: {
    width: '100%',
    height: 146,
    borderRadius: 12,
  },
  changeButton: {
    backdropFilter: 'blur(4px)',
  },
  removeButton: {
    backdropFilter: 'blur(4px)',
  },
});
