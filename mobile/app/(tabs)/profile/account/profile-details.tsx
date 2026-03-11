import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import * as Burnt from 'burnt';
import { LoaderCircle } from 'lucide-react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';

import {
  ScreenContainer,
  Text,
  Spacer,
  TextInput,
  PrimaryButton,
} from '@/components';
import { textStyles } from '@/utils/styles';
import { Colors } from '@/constants';
import CustomTextInput from '@/components/ui/custome-input';
import { Platform } from 'react-native';
import { getSupabaseClient } from '@/lib/supabase';
import { upsertUserProfile } from '@/services/profile.service';
import { profileSchema, ProfileFormData } from '@/schema/profile.schema';

export default function ProfileDetailsScreen() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileFormData, string>>
  >({});
  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const [name, setName] = useState(user?.username ?? '');
  const [email, setEmail] = useState(
    user?.emailAddresses[0]?.emailAddress ?? ''
  );
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phoneNumbers[0]?.phoneNumber ?? ''
  );

  const dynamicStyles = StyleSheet.create({
    spanText: {
      ...textStyles.regular_14,
      color: colors.textColors.subtitle,
      fontSize: 14,
    },
    labelStyle: {
      ...textStyles.subtitle_Regular,
      color: colors.textColors.default,
      fontSize: 16,
    },
  });

  const validateForm = (): boolean => {
    const formData: ProfileFormData = {
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
    };

    const result = profileSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProfileFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ProfileFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const updateUser = useCallback(async () => {
    if (!isLoaded || !user) return;

    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    try {
      await user.update({
        username: name.trim(),
        firstName: name.trim(),
      });

      const supabase = await getSupabaseClient(getToken);
      let updatedProfile = null;

      if (supabase) {
        const profileData: any = {
          clerk_user_id: user.id,
          username: name.trim(),
          full_name: name.trim(),
          email: user.emailAddresses[0]?.emailAddress || '',
        };

        // Only include phone number if it's provided
        if (phoneNumber && phoneNumber.trim()) {
          profileData.phone_number = phoneNumber.trim();
        }

        console.log(
          '[ProfileDetails] Attempting to update profile with:',
          profileData
        );

        // First try with phone number (if provided)
        updatedProfile = await upsertUserProfile(supabase, profileData);

        // If that fails and we had a phone number, try without it (fallback for migration not run yet)
        if (!updatedProfile && profileData.phone_number) {
          console.log(
            '[ProfileDetails] Phone number update failed, trying without phone_number field...'
          );
          const { phone_number, ...profileDataWithoutPhone } = profileData;
          updatedProfile = await upsertUserProfile(
            supabase,
            profileDataWithoutPhone
          );
        }

        if (!updatedProfile) {
          console.error(
            '[ProfileDetails] Profile update returned null - check database logs'
          );
          throw new Error(
            'Failed to update profile in database. Please run: supabase db push'
          );
        }
      }

      console.log('Profile updated successfully', {
        user,
        supabaseProfile: updatedProfile,
      });

      Burnt.toast({
        title: '🎉 Success!',
        preset: 'done',
        message: 'Your profile has been updated successfully.',
        duration: 3,
        from: 'bottom',
        haptic: 'success',
        shouldDismissByDrag: true,
      });
    } catch (error) {
      console.error('Profile update failed:', error);

      Burnt.toast({
        title: '😨 Oh no!',
        preset: 'error',
        message:
          'Something went wrong while updating your profile. Please try again.',
        duration: 3,
        from: 'bottom',
        haptic: 'error',
        shouldDismissByDrag: true,
      });
    } finally {
      setLoading(false);
      spinValue.setValue(0);
    }
  }, [isLoaded, user, name, getToken, spinValue]);

  return (
    <ScreenContainer leftComponent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}>
          <Spacer size={24} vertical />
          <Text style={dynamicStyles.spanText}>
            Keep your account info up to date and stay synced across all your
            trips.
          </Text>
          <Spacer size={32} vertical />

          {/* FORM */}
          <View style={styles.inputContainer}>
            <CustomTextInput
              label="User Name"
              placeholder={'Enter your name'}
              value={name ?? undefined}
              onChangeText={(text) => {
                setName(text);
                if (errors.name)
                  setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={errors.name}
            />
            <CustomTextInput
              label="Email Address"
              placeholder={'Enter your email address'}
              value={email ?? undefined}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <CustomTextInput
              label="Phone Number"
              placeholder={'Enter your phone number'}
              value={phoneNumber ?? undefined}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (errors.phoneNumber)
                  setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
              }}
              keyboardType="phone-pad"
              autoCapitalize="none"
              error={errors.phoneNumber}
            />
          </View>

          <Spacer size={48} vertical />
          <TouchableOpacity
            onPress={updateUser}
            disabled={loading}
            className="flex h-[50px] w-full items-center justify-center rounded-full bg-pink-600 disabled:opacity-50">
            <Text className="font-semibold text-white">
              {loading ? (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <LoaderCircle size={20} color="white" />
                </Animated.View>
              ) : (
                'Save Changes'
              )}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  inputContainer: {
    gap: 24,
  },
});
