import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';

import { Spacer } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import {
  ResetPasswordFormData,
  resetPasswordSchema,
} from '@/utils/validation/auth.validation';
import { ArrowLeft } from 'lucide-react-native';
import z from 'zod';
import CustomTextInput from '@/components/ui/custome-input';

const ResetPasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updatePassword, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ResetPasswordFormData>({
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (
    field: keyof ResetPasswordFormData,
    value: string
  ) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      resetPasswordSchema.parse(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const result = await updatePassword(formData.password);

      if (!result.success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Toast.show({
          type: 'error',
          text1: 'Reset Password Error',
          text2: result.error,
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: 'success',
          text1: 'Password Reset',
          text2: 'Your password has been successfully reset',
          position: 'bottom',
          visibilityTime: 3000,
          autoHide: true,
        });
        router.replace('/(auth)/login');
      }
    } catch (error: any) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (error instanceof z.ZodError) {
        const newErrors: ResetPasswordFormData = {
          password: '',
          confirmPassword: '',
        };
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const field = issue.path[0] as keyof ResetPasswordFormData;
            newErrors[field] = issue.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white px-[20px]">
        <View style={{ paddingTop: insets.top + 24 }}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gray-100">
              <ArrowLeft size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <Spacer size={32} vertical />

          <Text
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}
            className="text-3xl font-bold">
            Reset Password
          </Text>

          <Spacer size={16} vertical />

          <Text className="leading-relaxed text-gray-400">
            Please enter a new password that is different from your old
            password, and then confirm it in the field below.
          </Text>

          <Spacer size={40} vertical />

          <CustomTextInput
            label="Password"
            isPassword
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            error={errors.password}
          />

          <Spacer size={16} vertical />

          <CustomTextInput
            label="Confirm Password"
            isPassword
            value={formData.confirmPassword}
            onChangeText={(value) =>
              handleInputChange('confirmPassword', value)
            }
            error={errors.confirmPassword}
          />

          <Spacer size={32} vertical />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || authLoading}
            className="bg-primary flex h-[45px] w-full items-center justify-center rounded-full disabled:opacity-50">
            {isSubmitting || authLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-base font-medium text-white">Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
