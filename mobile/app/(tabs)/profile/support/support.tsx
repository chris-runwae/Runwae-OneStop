import { MenuItem, ScreenContainer } from '@/components';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

const Support = () => {
  return (
    <ScreenContainer leftComponent={true} className="flex-1 px-[12px] py-[8px]">
      <View className="flex-1 px-[12px] py-[8px]">
        <View>
          <MenuItem
            title="Help Center"
            subtitle="FAQs and Common issues"
            onPress={() => router.push('/(tabs)/profile/support/help-center')}
          />
          <MenuItem
            title="Contact Support"
            subtitle="Chat, Email or call options"
            onPress={() =>
              router.push('/(tabs)/profile/support/contact-support')
            }
          />
          <MenuItem
            title="Report a Problem"
            subtitle="Help us make Runwae better"
            onPress={() => router.push('/(tabs)/profile/support/report')}
          />
          <MenuItem
            title="Feedback & Suggestions"
            subtitle="Help us make Runwae better"
            onPress={() => router.push('/(tabs)/profile/support/feedback')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

export default Support;
