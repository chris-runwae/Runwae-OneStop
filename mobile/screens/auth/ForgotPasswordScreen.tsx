import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';

export function ForgotPasswordScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  if (!colors) {
    throw new Error('Invalid color scheme');
  }
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    code?: string;
    password?: string;
    general?: string;
  }>({});

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleSendResetCode = useCallback(async () => {
    if (!isLoaded) return;

    setErrors({});

    if (!email.trim() || !validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      console.log('[ForgotPassword] Sending reset code to:', email);
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      setStep('reset');
    } catch (error: any) {
      console.error('[ForgotPassword] Error:', error);
      const clerkError = error?.errors?.[0];
      if (clerkError?.code === 'form_identifier_not_found') {
        setErrors({ email: 'No account found with this email' });
      } else {
        setErrors({
          general: clerkError?.message || 'Failed to send reset code',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, signIn]);

  const handleResetPassword = useCallback(async () => {
    if (!isLoaded) return;

    setErrors({});

    if (!code || code.length !== 6) {
      setErrors({ code: 'Please enter the 6-digit code' });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);
    try {
      console.log('[ForgotPassword] Resetting password');
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        console.log('[ForgotPassword] Password reset successful');
        await setActive({ session: result.createdSessionId });
        Alert.alert('Success', 'Your password has been reset successfully.', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ]);
      } else {
        console.log(
          '[ForgotPassword] Reset incomplete, status:',
          result.status
        );
        setErrors({ general: 'Password reset incomplete. Please try again.' });
      }
    } catch (error: any) {
      console.error('[ForgotPassword] Reset error:', error);
      const clerkError = error?.errors?.[0];
      if (clerkError?.code === 'form_code_incorrect') {
        setErrors({ code: 'Incorrect verification code' });
      } else if (clerkError?.code === 'form_password_pwned') {
        setErrors({
          password:
            'This password has been compromised. Please choose a different one.',
        });
      } else {
        setErrors({
          general: clerkError?.message || 'Failed to reset password',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isLoaded, code, newPassword, signIn, setActive, router]);

  const handleResendCode = useCallback(async () => {
    if (!isLoaded) return;

    try {
      console.log('[ForgotPassword] Resending code');
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your email.'
      );
    } catch (error: any) {
      console.error('[ForgotPassword] Resend error:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  }, [isLoaded, email, signIn]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            onPress={() =>
              step === 'reset' ? setStep('email') : router.back()
            }
            style={styles.backButtonIcon}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, textStyles.h1, { color: colors.text }]}>
              {step === 'email' ? 'Reset password' : 'Create new password'}
            </Text>
            <Text
              style={[
                styles.subtitle,
                textStyles.body,
                { color: colors.textColors.subtitle },
              ]}>
              {step === 'email'
                ? 'Enter your email to receive a reset code'
                : `Enter the code sent to ${email}`}
            </Text>
          </View>

          {errors.general && (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: colors.destructiveColors.background },
              ]}>
              <Text
                style={[
                  textStyles.bodySmall,
                  { color: colors.destructiveColors.default },
                ]}>
                {errors.general}
              </Text>
            </View>
          )}

          {step === 'email' ? (
            <View style={styles.form}>
              <AuthInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoComplete="email"
                error={errors.email}
              />

              <AuthButton
                title="Send Reset Code"
                onPress={handleSendResetCode}
                loading={loading}
                disabled={!email}
                style={styles.submitButton}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <AuthInput
                label="Verification Code"
                placeholder="Enter 6-digit code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                error={errors.code}
              />

              <AuthInput
                label="New Password"
                placeholder="Enter new password (8+ characters)"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword
                autoComplete="new-password"
                error={errors.password}
              />

              <AuthButton
                title="Reset Password"
                onPress={handleResetPassword}
                loading={loading}
                disabled={code.length !== 6 || !newPassword}
                style={styles.submitButton}
              />

              <TouchableOpacity
                onPress={handleResendCode}
                style={styles.resendButton}>
                <Text style={[textStyles.body, { color: colors.primary }]}>
                  Resend code
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButtonIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    marginBottom: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {},
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  form: {
    gap: 4,
  },
  submitButton: {
    marginTop: 16,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
  },
});
