import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import * as Burnt from 'burnt';

import {
  ScreenContainer,
  Text,
  Spacer,
  TextInput,
  PrimaryButton,
} from '@/components';
import { textStyles } from '@/utils/styles';
import { Colors } from '@/constants';
import { useUser } from '@clerk/clerk-expo';

export default function ProfileDetailsScreen() {
  const { user, isLoaded } = useUser();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.fullName ?? undefined);
  const [email, setEmail] = useState(
    user?.emailAddresses[0]?.emailAddress ?? undefined
  );
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phoneNumbers[0]?.phoneNumber ?? undefined
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

  const updateUser = async () => {
    if (!isLoaded || !user) return;
    setLoading(true);

    try {
      await user?.update({
        firstName: name,
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

      setName(undefined);
      setEmail(undefined);
      setPhoneNumber(undefined);
    } catch (error) {
      console.error(error);
      Burnt.toast({
        title: '😨 Oh no!',
        preset: 'error',
        message:
          'Something went wrong while updating your profile. Please try again.',
        duration: 3,
        from: 'bottom',
        haptic: 'error',
        shouldDismissByDrag: true,
        // style: {
        //   backgroundColor: colors.backgroundColors.subtle,
        //   borderRadius: 8,
        //   padding: 12,
        // },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer leftComponent={true}>
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
          <TextInput
            label="User Name"
            placeholder={user?.username ?? 'Enter your name'}
            value={name ?? undefined}
            onChangeText={(text) => setName(text)}
            labelStyle={dynamicStyles.labelStyle}
          />
          <TextInput
            label="Email Address"
            placeholder={
              user?.emailAddresses[0]?.emailAddress ??
              'Enter your email address'
            }
            value={email ?? undefined}
            onChangeText={(text) => setEmail(text)}
            labelStyle={dynamicStyles.labelStyle}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Phone Number"
            placeholder={
              user?.phoneNumbers[0]?.phoneNumber ?? 'Enter your phone number'
            }
            value={phoneNumber ?? undefined}
            onChangeText={(text) => setPhoneNumber(text)}
            labelStyle={dynamicStyles.labelStyle}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
        </View>

        <Spacer size={48} vertical />
        <PrimaryButton
          onPress={updateUser}
          title="Save Changes"
          loading={loading}
        />
      </ScrollView>
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
