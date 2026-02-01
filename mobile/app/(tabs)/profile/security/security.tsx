import { MenuItem, ScreenContainer } from '@/components';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

const Security = () => {
  return (
    <ScreenContainer leftComponent={true} className="flex-1 px-[12px] py-[8px]">
      <View className="flex-1 px-[12px] py-[8px]">
        <View>
          <MenuItem
            title="Change your password"
            subtitle="Keep your account secure with a new password."
            onPress={() =>
              router.push('/(tabs)/profile/security/change-password')
            }
          />
          <MenuItem
            title="Two-factor authentication"
            subtitle="Add an extra layer of protection to your account."
            onPress={() =>
              router.push('/(tabs)/profile/security/two-factor-auth')
            }
          />
          <MenuItem
            title="Privacy Settings"
            subtitle="Control who can see your trips or invites"
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

export default Security;
