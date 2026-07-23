import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ArrowRight, Map, Users, Sparkles } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { toast } from 'burnt';

import Text from '@/components/ui/Text';
import { useAuth } from '@/context/AuthContext';
import { AppFonts, COLORS } from '@/constants';
import {
  AnimatedFeatureIcon,
  AnimatedOption,
  CustomImageBackground,
  FeatureCard,
} from './OnboardingComponents';

const { width } = Dimensions.get('window');

import { AppleLogo, GoogleLogo } from '@/components/auth/SocialAuthButtons';
import { EmailAuthForm } from '@/components/auth/EmailAuthForm';

interface SlideProps {
  slide: any;
  slideAnimation: any;
  selectedOptions: string[];
  handleOptionSelect: (optionId: string) => void;
  handleNext: () => void;
  colors: any;
  isDarkMode: boolean;
}

interface Option {
  id: string;
  text: string;
  icon: string;
}

interface Feature {
  text: string;
  icon: string;
}

export const WelcomeSlide: React.FC<SlideProps> = ({
  slide,
  slideAnimation,
  handleNext,
  colors,
}) => {
  const slideAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: slideAnimation.value,
      transform: [
        {
          translateX: interpolate(
            slideAnimation.value,
            [0, 1],
            [width * 0.1, 0]
          ),
        },
      ],
    };
  });

  return (
    <View style={{ width }} className="flex-1">
      <CustomImageBackground
        source={{ uri: slide.image || '' }}
        className="flex-1 justify-end">
        <Animated.View
          style={[slideAnimStyle]}
          className="py-200 flex-1 justify-end bg-black/40 p-8">
          <Text
            replaceDefaultStyle
            className="mb-3 text-5xl font-bold text-white"
            style={{ fontFamily: AppFonts.bricolage.bold }}>
            {slide.title}
          </Text>
          <Text
            replaceDefaultStyle
            className="mb-10 text-lg text-white/90"
            style={{ fontFamily: AppFonts.inter.regular }}>
            {slide.description}
          </Text>
          <View className="mb-8 flex-row items-center justify-between">
            <View className="flex-row ">
              <AnimatedFeatureIcon
                icon={<Map size={24} color="white" />}
                label="Plan"
                index={0}
                marginRight={true}
              />
              <AnimatedFeatureIcon
                icon={<Users size={24} color="white" />}
                label="Group"
                index={1}
                marginRight={true}
              />
              <AnimatedFeatureIcon
                icon={<Sparkles size={24} color="white" />}
                label="Book"
                index={2}
              />
            </View>
            <TouchableOpacity
              onPress={handleNext}
              className="bottom-0 right-0 h-16 w-16 flex-row items-center justify-center rounded-full"
              style={{ backgroundColor: colors.primaryColors.default }}>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </CustomImageBackground>
    </View>
  );
};

export const AuthSlide: React.FC<SlideProps> = ({
  // slide,
  slideAnimation,
  handleNext,
  colors,
  isDarkMode,
}) => {
  const { signInWithApple, signInWithGoogle } = useAuth();
  const [socialLoading, setSocialLoading] = useState<'apple' | 'google' | null>(
    null
  );

  const slideAnimStyle = useAnimatedStyle(() => ({
    opacity: slideAnimation.value,
    transform: [
      { translateY: interpolate(slideAnimation.value, [0, 1], [20, 0]) },
    ],
  }));

  // Run the real provider sign-in; RouteGuard swaps to the authed stack on success.
  const handleSSOSignIn = async (provider: 'apple' | 'google') => {
    if (socialLoading) return;
    setSocialLoading(provider);
    try {
      const result =
        provider === 'apple'
          ? await signInWithApple()
          : await signInWithGoogle();
      if (!result.success && result.error) {
        toast({
          title: provider === 'apple' ? 'Apple sign-in' : 'Google sign-in',
          message: result.error,
          preset: 'error',
          duration: 4,
          haptic: 'error',
        });
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const authStyles = {
    bodyText: {
      fontFamily: AppFonts.inter.medium,
      fontSize: 14
    }
  };

  return (
    <View style={{ width }} className="flex-1 pb-6">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={120}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Animated.View style={slideAnimStyle} className="px-6">
            <>
              <Text
                replaceDefaultStyle
                className="mb-2 mt-4 text-4xl font-bold"
                style={{
                  fontFamily: AppFonts.bricolage.bold,
                  color: colors.textColors.default,
                }}>
                Let&apos;s get you set up 🔐
              </Text>
              <Text
                className="mb-16 text-base"
                style={{ color: colors.textColors.subtitle }}>
                Use an account to save your preferences and plan trips with your
                crew.
              </Text>
            </>

            <>
              {/* Apple SSO — iOS only, per Sign in with Apple guidelines */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={() => handleSSOSignIn('apple')}
                  disabled={socialLoading !== null}
                  className="mb-3 flex-row items-center justify-center rounded-xl py-4"
                  style={{
                    backgroundColor: isDarkMode ? '#fff' : '#000',
                    opacity: socialLoading !== null ? 0.6 : 1,
                  }}>
                  {socialLoading === 'apple' ? (
                    <ActivityIndicator
                      size="small"
                      color={isDarkMode ? '#000' : '#fff'}
                    />
                  ) : (
                    <>
                      <AppleLogo color={isDarkMode ? '#000' : '#fff'} />
                      <Text
                        replaceDefaultStyle
                        className="ml-3 text-base"
                        style={{
                          color: isDarkMode ? '#000' : '#fff',
                          ...authStyles.bodyText,
                        }}>
                        Continue with Apple
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Google SSO */}
              <TouchableOpacity
                onPress={() => handleSSOSignIn('google')}
                disabled={socialLoading !== null}
                className="mb-6 flex-row items-center justify-center rounded-xl border py-4"
                style={{
                  borderColor: colors.borderColors.subtle,
                  backgroundColor: colors.backgroundColors.subtle,
                  opacity: socialLoading !== null ? 0.6 : 1,
                }}>
                {socialLoading === 'google' ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.textColors.default}
                  />
                ) : (
                  <>
                    <GoogleLogo />
                    <Text
                      className="ml-3 text-base"
                      style={{
                        color: colors.textColors.default,
                        ...authStyles.bodyText,
                      }}>
                      Continue with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="mb-6 flex-row items-center gap-x-3">
                <View
                  className="h-px flex-1"
                  style={{ backgroundColor: colors.borderColors.subtle }}
                />
                <Text style={{ color: colors.textColors.subtitle }}>or</Text>
                <View
                  className="h-px flex-1"
                  style={{ backgroundColor: colors.borderColors.subtle }}
                />
              </View>

              {/* Email/Password */}
              <EmailAuthForm
                onSignInSuccess={() => router.replace('/(tabs)/home')}
                onSignUpSuccess={handleNext}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            </>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export const ChoiceSlide: React.FC<SlideProps> = ({
  slide,
  slideAnimation,
  selectedOptions,
  handleOptionSelect,
  colors,
  isDarkMode,
}) => {
  const slideAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: slideAnimation.value,
      transform: [
        {
          translateX: interpolate(
            slideAnimation.value,
            [0, 1],
            [width * 0.1, 0]
          ),
        },
      ],
    };
  });

  return (
    <View className="flex-1 px-6 pt-6" style={{ width }}>
      <Animated.View style={[slideAnimStyle]} className="flex-1">
        <Text
          className="mb-6 text-2xl font-bold"
          style={{ color: colors.textColors.default }}>
          {slide.question}
        </Text>

        {slide.description && (
          <Text
            className="mb-6 text-base"
            style={{
              color: colors.textColors.subtitle,
            }}>
            {slide.description}
          </Text>
        )}

        <View className="gap-y-3">
          {slide.options?.map((option: Option, index: number) => {
            const isSelected = selectedOptions.includes(option.id);
            return (
              <AnimatedOption
                key={option.id}
                option={option}
                index={index}
                isSelected={isSelected}
                onSelect={() => handleOptionSelect(option.id)}
                isDarkMode={isDarkMode}
                colors={COLORS}
              />
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

export const FeaturesSlide: React.FC<SlideProps> = ({
  slide,
  slideAnimation,
  colors,
  isDarkMode,
}) => {
  const slideAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: slideAnimation.value,
      transform: [
        {
          translateX: interpolate(
            slideAnimation.value,
            [0, 1],
            [width * 0.1, 0]
          ),
        },
      ],
    };
  });

  return (
    <View style={{ width }} className="flex-1 px-6 pt-6">
      <Animated.View style={[slideAnimStyle]} className="flex-1">
        <Text
          replaceDefaultStyle
          className="mb-3 text-3xl font-bold"
          style={{
            color: colors.textColors.default,
            fontFamily: AppFonts.bricolage.bold,
          }}>
          {slide.title}
        </Text>
        <Text
          replaceDefaultStyle
          className="mb-8 text-base"
          style={{
            color: colors.textColors.subtitle,
            fontFamily: AppFonts.inter.regular,
          }}>
          {slide.description}
        </Text>

        <View className="mb-6">
          {slide.features?.map((feature: Feature, index: number) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              feature={feature.text}
              index={index}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};
