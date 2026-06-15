import * as Haptics from 'expo-haptics';
import z from 'zod';
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, Check, Mail } from 'lucide-react-native';
import { Toast } from 'toastify-react-native';

import Text from '@/components/ui/Text';
import { Spacer } from '@/components';
import CustomTextInput from '@/components/containers/TextInput';
import { AppFonts } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import {
  LoginFormData,
  loginSchema,
  signUpSchema,
  SignUpFormData,
} from '@/utils/validation/auth.validation';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type AuthFormState = 'signin' | 'signup' | 'verify' | 'forgot' | 'sent';

export const EmailAuthForm: React.FC<{
  onSignInSuccess: () => void; // → home
  onSignUpSuccess: () => void; // → choices slide
  colors: any;
  isDarkMode: boolean;
}> = ({ onSignInSuccess, onSignUpSuccess, colors, isDarkMode }) => {
  const { signIn, signUp } = useAuth();

  const [formState, setFormState] = useState<AuthFormState>('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    password: '',
  });

  // ─── Helpers ───────────────────────────────────────────────────────

  const transition = (next: AuthFormState) => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        200,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );
    setErrors({ fullName: '', email: '', password: '' });
    setFormState(next);
  };

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleBlur = (
    field: keyof SignUpFormData,
    schema: typeof loginSchema | typeof signUpSchema
  ) => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === field);
      setErrors((prev) => ({
        ...prev,
        [field]: issue?.message ?? '',
      }));
    }
  };

  const primaryBtn = (
    label: string,
    onPress: () => void,
    loading?: boolean
  ) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading ?? isSubmitting}
      style={{
        backgroundColor: colors.primaryColors.default,
        opacity: (loading ?? isSubmitting) ? 0.6 : 1,
      }}
      className="h-[52px] w-full items-center justify-center rounded-2xl">
      {(loading ?? isSubmitting) ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text
          replaceDefaultStyle
          style={{ fontFamily: AppFonts.inter.semiBold }}
          className="text-base font-semibold text-white">
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );

  const toggleRow = (prompt: string, action: string, next: AuthFormState) => (
    <View className="mt-4 flex-row items-center justify-center gap-x-1">
      <Text
        replaceDefaultStyle
        style={{ color: colors.textColors.subtitle }}
        className="text-sm">
        {prompt}
      </Text>
      <TouchableOpacity onPress={() => transition(next)}>
        <Text
          replaceDefaultStyle
          style={{ color: colors.primaryColors.default }}
          className="text-sm font-medium">
          {action}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Handlers ──────────────────────────────────────────────────────

  const handleSignIn = async () => {
    setIsSubmitting(true);
    try {
      loginSchema.parse(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const result = await signIn(formData.email, formData.password);

      if (result.needsVerification) {
        // Convex Auth sent an OTP to their email instead of creating
        // a session — route to verify state
        transition('verify');
        return;
      }

      if (!result.success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Toast.show({
          type: 'error',
          text1: "Couldn't sign in",
          text2: result.error,
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
        });
        return;
      }

      // Success → home
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSignInSuccess();
    } catch (error) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (error instanceof z.ZodError) {
        const newErrors = { fullName: '', email: '', password: '' };
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof SignUpFormData;
          if (field) newErrors[field] = issue.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    setIsSubmitting(true);
    try {
      signUpSchema.parse(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const result = await signUp(
        formData.email,
        formData.password,
        formData.fullName
      );

      // if (result.success && result.needsVerification) {
      //   // Account created — Convex sent OTP to verify email
      //   transition('verify');
      //   return;
      // }

      if (!result.success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Toast.show({
          type: 'error',
          text1: "Couldn't create account",
          text2: result.error,
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
        });
        return;
      }

      // Success → choices slide
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSignUpSuccess();
    } catch (error) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (error instanceof z.ZodError) {
        const newErrors = { fullName: '', email: '', password: '' };
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof SignUpFormData;
          if (field) newErrors[field] = issue.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    // Wire up your Convex password reset mutation here
    transition('sent');
  };

  // ─── Verify state ──────────────────────────────────────────────────
  if (formState === 'verify') {
    return (
      <View className="items-center py-8">
        <View
          style={{ backgroundColor: 'rgba(255,46,146,0.12)' }}
          className="mb-4 h-14 w-14 items-center justify-center rounded-full">
          <Mail size={26} color={colors.primaryColors.default} />
        </View>
        <Text
          replaceDefaultStyle
          style={{
            fontFamily: AppFonts.bricolage.bold,
            color: colors.textColors.default,
          }}
          className="mb-2 text-xl font-bold">
          Verify your email
        </Text>
        <Text
          replaceDefaultStyle
          style={{ color: colors.textColors.subtitle }}
          className="mb-2 text-center text-sm leading-5">
          We sent a 6-digit code to
        </Text>
        <Text
          replaceDefaultStyle
          style={{ color: colors.primaryColors['300'] }}
          className="mb-6 text-center text-sm font-medium">
          {formData.email}
        </Text>

        <CustomTextInput
          label="Verification code"
          keyboardType="numeric"
          autoCapitalize="none"
          placeholder="000000"
          value={formData.password} // reuse a temp field or add otp state below
          onChangeText={(value) => handleInputChange('password', value)}
          error={errors.password}
        />
        <Spacer size={16} vertical />

        {primaryBtn('Verify email', async () => {
          // Wire up verifyOtp(formData.email, otpCode) from your auth context
          // On success, sign-up flow calls onSignUpSuccess()
          //             sign-in flow calls onSignInSuccess()
        })}

        <TouchableOpacity
          onPress={() => {
            // resendOtp(formData.email)
          }}
          className="mt-3 py-2">
          <Text
            replaceDefaultStyle
            style={{ color: colors.primaryColors.default }}
            className="text-sm">
            Resend code
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => transition('signin')}
          className="mt-2 py-2">
          <Text
            replaceDefaultStyle
            style={{ color: colors.textColors.subtitle }}
            className="text-sm">
            Use a different email
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Sent state ────────────────────────────────────────────────────
  if (formState === 'sent') {
    return (
      <View className="items-center py-8">
        <View
          style={{ backgroundColor: 'rgba(255,46,146,0.12)' }}
          className="mb-4 h-14 w-14 items-center justify-center rounded-full">
          <Check size={26} color={colors.primaryColors.default} />
        </View>
        <Text
          replaceDefaultStyle
          style={{
            fontFamily: AppFonts.bricolage.bold,
            color: colors.textColors.default,
          }}
          className="mb-2 text-xl font-bold">
          Check your inbox
        </Text>
        <Text
          replaceDefaultStyle
          style={{ color: colors.textColors.subtitle }}
          className="mb-6 text-center text-sm leading-5">
          We sent a reset link to{' '}
          <Text
            replaceDefaultStyle
            style={{ color: colors.primaryColors['300'] }}>
            {formData.email}
          </Text>
          . It expires in 15 minutes.
        </Text>
        {primaryBtn('Back to sign in', () => transition('signin'))}
        <TouchableOpacity onPress={handleForgotPassword} className="mt-3 py-2">
          <Text
            replaceDefaultStyle
            style={{ color: colors.primaryColors.default }}
            className="text-sm">
            Resend link
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Forgot state ──────────────────────────────────────────────────
  if (formState === 'forgot') {
    return (
      <View>
        <TouchableOpacity
          onPress={() => transition('signin')}
          className="mb-5 flex-row items-center gap-x-1">
          <ChevronLeft size={16} color={colors.textColors.subtitle} />
          <Text
            replaceDefaultStyle
            style={{ color: colors.textColors.subtitle }}
            className="text-sm">
            Back to sign in
          </Text>
        </TouchableOpacity>

        <Text
          replaceDefaultStyle
          style={{
            fontFamily: AppFonts.bricolage.bold,
            color: colors.textColors.default,
          }}
          className="mb-1 text-2xl font-bold">
          Forgot password?
        </Text>
        <Text
          replaceDefaultStyle
          style={{ color: colors.textColors.subtitle }}
          className="mb-6 text-sm leading-5">
          Enter your email and we&apos;ll send a link to reset your password.
        </Text>

        <CustomTextInput
          label="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          onBlur={() => handleBlur('email', loginSchema)}
          error={errors.email}
        />
        <Spacer size={16} vertical />
        {primaryBtn('Send reset link', handleForgotPassword)}
      </View>
    );
  }

  // ─── Sign up state ─────────────────────────────────────────────────
  if (formState === 'signup') {
    return (
      <View>
        <Text
          replaceDefaultStyle
          style={{
            fontFamily: AppFonts.bricolage.bold,
            color: colors.textColors.default,
          }}
          className="mb-1 text-2xl font-bold">
          Create account
        </Text>
        <Text
          replaceDefaultStyle
          style={{ color: colors.textColors.subtitle }}
          className="mb-6 text-sm">
          Join Runwae and start planning trips together.
        </Text>

        <CustomTextInput
          label="Full name"
          placeholder="Chris Obocha"
          autoCapitalize="words"
          value={formData.fullName}
          onChangeText={(value) => handleInputChange('fullName', value)}
          onBlur={() => handleBlur('fullName', signUpSchema)}
          error={errors.fullName}
        />
        <Spacer size={12} vertical />
        <CustomTextInput
          label="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          onBlur={() => handleBlur('email', signUpSchema)}
          error={errors.email}
        />
        <Spacer size={12} vertical />
        <CustomTextInput
          label="Password"
          isPassword
          placeholder="Min. 8 characters"
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          onBlur={() => handleBlur('password', signUpSchema)}
          error={errors.password}
        />
        <Spacer size={20} vertical />
        {primaryBtn('Create account', handleSignUp)}
        {toggleRow('Already have an account?', 'Sign in', 'signin')}
      </View>
    );
  }

  // ─── Sign in state (default) ───────────────────────────────────────
  return (
    <View>
      <CustomTextInput
        label="Email address"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        onBlur={() => handleBlur('email', loginSchema)}
        error={errors.email}
      />
      <Spacer size={12} vertical />
      <CustomTextInput
        label="Password"
        isPassword
        value={formData.password}
        onChangeText={(value) => handleInputChange('password', value)}
        onBlur={() => handleBlur('password', loginSchema)}
        error={errors.password}
      />
      <Spacer size={8} vertical />

      <TouchableOpacity
        onPress={() => transition('forgot')}
        className="self-end">
        <Text
          replaceDefaultStyle
          style={{ color: colors.primaryColors.default }}
          className="text-sm">
          Forgot password?
        </Text>
      </TouchableOpacity>
      <Spacer size={20} vertical />

      {primaryBtn('Sign in', handleSignIn)}
      {toggleRow("Don't have an account?", 'Sign up', 'signup')}
    </View>
  );
};
