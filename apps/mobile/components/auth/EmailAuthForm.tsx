import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { ChevronLeft, Check } from 'lucide-react-native';

import Text from '@/components/ui/Text';
import { Spacer } from '@/components';
import CustomTextInput from '@/components/containers/TextInput';
import { AppFonts } from '@/constants';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type AuthFormState = 'signin' | 'signup' | 'forgot' | 'sent';

export const EmailAuthForm: React.FC<{
  onSuccess: () => void;
  colors: any;
  isDarkMode: boolean;
}> = ({ onSuccess, colors, isDarkMode }) => {
  const [formState, setFormState] = useState<AuthFormState>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transition = (next: AuthFormState) => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        200,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );
    setError(null);
    setFormState(next);
  };

  const primaryBtn = (label: string, onPress: () => void) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={{ backgroundColor: colors.primaryColors.default }}
      className="h-[52px] w-full items-center justify-center rounded-2xl disabled:opacity-50">
      <Text
        replaceDefaultStyle
        style={{ fontFamily: AppFonts.inter.semiBold }}
        className="text-base font-semibold text-white">
        {isLoading ? 'Please wait...' : label}
      </Text>
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
            {email}
          </Text>
          . It expires in 15 minutes.
        </Text>
        {primaryBtn('Back to sign in', () => transition('signin'))}
        <TouchableOpacity onPress={() => {}} className="mt-3 py-2">
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
          value={email}
          onChangeText={setEmail}
          error={error ?? undefined}
        />
        <Spacer size={16} vertical />
        {primaryBtn('Send reset link', () => transition('sent'))}
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
          value={name}
          onChangeText={setName}
        />
        <Spacer size={12} vertical />
        <CustomTextInput
          label="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={error ?? undefined}
        />
        <Spacer size={12} vertical />
        <CustomTextInput
          label="Password"
          isPassword
          placeholder="Min. 8 characters"
          value={password}
          onChangeText={setPassword}
          error={error ?? undefined}
        />
        <Spacer size={20} vertical />
        {primaryBtn('Create account', () => {})}
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
        value={email}
        onChangeText={setEmail}
        error={error ?? undefined}
      />
      <Spacer size={12} vertical />
      <CustomTextInput
        label="Password"
        isPassword
        value={password}
        onChangeText={setPassword}
        error={error ?? undefined}
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

      {primaryBtn('Sign in', () => {})}
      {toggleRow("Don't have an account?", 'Sign up', 'signup')}
    </View>
  );
};
