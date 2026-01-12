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
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';

export function SignUpScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  if (!colors) {
    throw new Error('Invalid color scheme');
  }
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    code?: string;
    general?: string;
  }>({});

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;

    setErrors({});

    if (!email.trim() || !validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    if (!password || password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);
    try {
      console.log('[SignUp] Creating account for:', email);

      const signUpParams: {
        emailAddress: string;
        password: string;
        username?: string;
      } = {
        emailAddress: email,
        password,
      };

      if (username.trim()) {
        signUpParams.username = username.trim();
      }

      await signUp.create(signUpParams);

      console.log('[SignUp] Preparing email verification');
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
    } catch (error: any) {
      console.error('[SignUp] Error:', error);
      const clerkError = error?.errors?.[0];
      if (clerkError) {
        if (clerkError.code === 'form_identifier_exists') {
          setErrors({ email: 'An account with this email already exists' });
        } else if (clerkError.code === 'form_username_exists') {
          setErrors({ username: 'This username is already taken' });
        } else if (clerkError.code === 'form_password_pwned') {
          setErrors({
            password:
              'This password has been compromised. Please choose a different one.',
          });
        } else {
          setErrors({
            general: clerkError.message || 'Failed to create account',
          });
        }
      } else {
        setErrors({ general: 'An unexpected error occurred' });
      }
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, username, password, signUp]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded) return;

    setErrors({});

    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ code: 'Please enter the 6-digit code' });
      return;
    }

    setVerifyLoading(true);
    try {
      console.log('[SignUp] Verifying email code');
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete') {
        console.log('[SignUp] Verification successful');
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        console.log('[SignUp] Verification incomplete, status:', result.status);
        setErrors({ general: 'Verification incomplete. Please try again.' });
      }
    } catch (error: any) {
      console.error('[SignUp] Verification error:', error);
      const clerkError = error?.errors?.[0];
      if (clerkError?.code === 'form_code_incorrect') {
        setErrors({ code: 'Incorrect verification code' });
      } else {
        setErrors({ general: clerkError?.message || 'Verification failed' });
      }
    } finally {
      setVerifyLoading(false);
    }
  }, [isLoaded, verificationCode, signUp, setActive, router]);

  const handleResendCode = useCallback(async () => {
    if (!isLoaded) return;

    try {
      console.log('[SignUp] Resending verification code');
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your email.'
      );
    } catch (error: any) {
      console.error('[SignUp] Resend error:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  }, [isLoaded, signUp]);

  const handleOAuthSuccess = useCallback(() => {
    console.log('[SignUp] OAuth success, navigating to tabs');
    router.replace('/(tabs)');
  }, [router]);

  const handleOAuthError = useCallback((error: string) => {
    console.error('[SignUp] OAuth error:', error);
    Alert.alert('Sign Up Error', error);
  }, []);

  if (pendingVerification) {
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
            <View style={styles.header}>
              <Text
                style={[styles.title, textStyles.h1, { color: colors.text }]}>
                Verify your email
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  textStyles.body,
                  { color: colors.textColors.subtitle },
                ]}>
                We have sent a 6-digit code to {email}
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

            <View style={styles.form}>
              <AuthInput
                label="Verification Code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
                error={errors.code}
              />

              <AuthButton
                title="Verify Email"
                onPress={handleVerify}
                loading={verifyLoading}
                disabled={verificationCode.length !== 6}
              />

              <TouchableOpacity
                onPress={handleResendCode}
                style={styles.resendButton}>
                <Text
                  style={[
                    textStyles.body,
                    { color: colors.primaryColors.default },
                  ]}>
                  Resend code
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setPendingVerification(false)}
              style={styles.backButton}>
              <Text
                style={[
                  textStyles.body,
                  { color: colors.textColors.subtitle },
                ]}>
                Back to sign up
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.backgroundColors.default },
      ]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, textStyles.h1, { color: colors.text }]}>
              Create account
            </Text>
            <Text
              style={[
                styles.subtitle,
                textStyles.body,
                { color: colors.textColors.subtitle },
              ]}>
              Sign up to get started
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

            <AuthInput
              label="Username (optional)"
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              autoComplete="username"
              error={errors.username}
            />

            <AuthInput
              label="Password"
              placeholder="Create a password (8+ characters)"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoComplete="new-password"
              error={errors.password}
            />

            <AuthButton
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              disabled={!email || !password}
              style={styles.signUpButton}
            />
          </View>

          <SocialAuthButtons
            onSuccess={handleOAuthSuccess}
            onError={handleOAuthError}
          />

          <View style={styles.footer}>
            <Text
              style={[textStyles.body, { color: colors.textColors.subtitle }]}>
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text
                  style={[
                    textStyles.body,
                    { color: colors.primary, fontWeight: '600' as const },
                  ]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
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
    paddingTop: 40,
    paddingBottom: 24,
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
  signUpButton: {
    marginTop: 16,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
});
