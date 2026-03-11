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
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from '@/utils/validation/auth.validation';
import { ArrowLeft } from 'lucide-react-native';
import z from 'zod';
import CustomTextInput from '@/components/ui/custome-input';

const ForgotPasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { resetPassword, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<ForgotPasswordFormData>({
    email: '',
  });

  const handleInputChange = (
    field: keyof ForgotPasswordFormData,
    value: string
  ) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      forgotPasswordSchema.parse(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const result = await resetPassword(formData.email);

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
          text1: 'Email Sent',
          text2: 'Password reset link has been sent to your email',
          position: 'bottom',
          visibilityTime: 3000,
          autoHide: true,
        });
        router.push({
          pathname: '/(auth)/check-email',
          params: { email: formData.email },
        } as any);
      }
    } catch (error: any) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (error instanceof z.ZodError) {
        const newErrors: ForgotPasswordFormData = { email: '' };
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const field = issue.path[0] as keyof ForgotPasswordFormData;
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
              className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gray-200">
              <ArrowLeft size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <Spacer size={32} vertical />

          <Text
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}
            className="text-3xl font-bold">
            Forgot Password?
          </Text>

          <Spacer size={16} vertical />

          <Text className="leading-relaxed text-gray-400">
            No worries! Please enter the email associated with your account and
            we will send you a reset link.
          </Text>

          <Spacer size={40} vertical />

          <CustomTextInput
            label="Email Address"
            keyboardType="email-address"
            placeholder="example@email.com"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            error={errors.email}
          />

          <Spacer size={32} vertical />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || authLoading}
            className="bg-primary flex h-[45px] w-full items-center justify-center rounded-full disabled:opacity-50">
            {isSubmitting || authLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-base font-medium text-white">Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
