import { ScreenContainer } from '@/components';
import Accordion from '@/components/accordion';
import React from 'react';
import { Text, View } from 'react-native';
import { helpCenterData } from '@/constants/help-center.contant';

const HelpCenter = () => {
  return (
    <ScreenContainer leftComponent={true} className="flex-1 px-[12px] py-[8px]">
      <View className="flex-1 px-[12px] py-[8px]">
        <View>
          <Text className="text-xs text-[#ADB5BD]">
            Find clarity for every step of your Runwae journey.
          </Text>

          <View className="mt-20">
            <Accordion data={helpCenterData} />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default HelpCenter;
