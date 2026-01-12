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
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';

export function SignInScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = useCallback(async () => {
    if (!isLoaded) return;

    setErrors({});

    if (!emailOrUsername.trim()) {
      setErrors({ email: 'Email or username is required' });
      return;
    }

    if (!password || password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);
    try {
      console.log(
        '[SignIn] Attempting sign in with identifier:',
        emailOrUsername
      );
      const result = await signIn.create({
        identifier: emailOrUsername,
        password,
      });

      if (result.status === 'complete') {
        console.log('[SignIn] Sign in successful');
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        console.log('[SignIn] Sign in incomplete, status:', result.status);
        setErrors({ general: 'Sign in incomplete. Please try again.' });
      }
    } catch (error: any) {
      console.error('[SignIn] Error:', error);
      const clerkError = error?.errors?.[0];
      if (clerkError) {
        if (clerkError.code === 'form_identifier_not_found') {
          setErrors({ email: 'No account found with this email or username' });
        } else if (clerkError.code === 'form_password_incorrect') {
          setErrors({ password: 'Incorrect password' });
        } else {
          setErrors({ general: clerkError.message || 'Failed to sign in' });
        }
      } else {
        setErrors({ general: 'An unexpected error occurred' });
      }
    } finally {
      setLoading(false);
    }
  }, [isLoaded, emailOrUsername, password, signIn, setActive, router]);

  const handleMagicLink = useCallback(async () => {
    if (!isLoaded) return;

    setErrors({});

    if (!emailOrUsername.trim() || !validateEmail(emailOrUsername)) {
      setErrors({ email: 'Please enter a valid email address for magic link' });
      return;
    }

    setMagicLinkLoading(true);
    try {
      console.log('[SignIn] Sending magic link to:', emailOrUsername);
      await signIn.create({
        identifier: emailOrUsername,
        strategy: 'email_link',
        redirectUrl: 'myapp://sign-in-callback',
      });

      router.push({
        pathname: '/(auth)/email-sent',
        params: { email: emailOrUsername, type: 'magic-link' },
      });
    } catch (error: any) {
      console.error('[SignIn] Magic link error:', error);
      const clerkError = error?.errors?.[0];
      setErrors({
        general: clerkError?.message || 'Failed to send magic link',
      });
    } finally {
      setMagicLinkLoading(false);
    }
  }, [isLoaded, emailOrUsername, signIn, router]);

  const handleOAuthSuccess = useCallback(() => {
    console.log('[SignIn] OAuth success, navigating to tabs');
    router.replace('/(tabs)');
  }, [router]);

  const handleOAuthError = useCallback((error: string) => {
    console.error('[SignIn] OAuth error:', error);
    Alert.alert('Sign In Error', error);
  }, []);

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
            <Text style={[styles.title, textStyles.h1, { color: colors.text }]}>
              Welcome back
            </Text>
            <Text
              style={[
                styles.subtitle,
                textStyles.body,
                { color: colors.textColors.subtitle },
              ]}>
              Sign in to continue to your account
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
              label="Email or Username"
              placeholder="Enter your email or username"
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              keyboardType="email-address"
              autoComplete="email"
              error={errors.email}
            />

            <AuthInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoComplete="password"
              error={errors.password}
            />

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={[textStyles.bodySmall, { color: colors.primary }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </Link>

            <AuthButton
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
              disabled={!emailOrUsername || !password}
            />

            <AuthButton
              title="Sign in with Magic Link"
              variant="secondary"
              onPress={handleMagicLink}
              loading={magicLinkLoading}
              disabled={!emailOrUsername || !validateEmail(emailOrUsername)}
              style={styles.magicLinkButton}
            />
          </View>

          <SocialAuthButtons
            onSuccess={handleOAuthSuccess}
            onError={handleOAuthError}
          />

          <View style={styles.footer}>
            <Text
              style={[textStyles.body, { color: colors.textColors.subtitle }]}>
              Do not have an account?{' '}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text
                  style={[
                    textStyles.body,
                    { color: colors.primary, fontWeight: '600' as const },
                  ]}>
                  Sign Up
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 4,
  },
  magicLinkButton: {
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
});
