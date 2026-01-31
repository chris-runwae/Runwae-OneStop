import { ScreenContainer } from '@/components';
import React from 'react';
import { View } from 'react-native';

const HelpCenter = () => {
  return (
    <ScreenContainer leftComponent={true} className="flex-1 px-[12px] py-[8px]">
      <View className="flex-1 px-[12px] py-[8px]">
        <View></View>
      </View>
    </ScreenContainer>
  );
};

export default HelpCenter;
