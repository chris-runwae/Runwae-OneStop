import { ScreenContainer } from '@/components';
import RadioButton from '@/components/ui/radio-button';
import { privacySettingOptions } from '@/constants/profile/security.constant';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

const PrivacySettings = () => {
  const [selectedPrivacy, setSelectedPrivacy] = useState(0);

  const handlePrivacyChange = (index: number) => {
    setSelectedPrivacy(index);
  };

  const updatedPrivacyOptions = privacySettingOptions.map((option, index) => ({
    ...option,
    checked: index === selectedPrivacy,
    setChecked: (checked: boolean) => {
      if (checked) {
        handlePrivacyChange(index);
      }
    },
  }));

  return (
    <ScreenContainer leftComponent={true} className="flex-1 px-[12px] py-[8px]">
      <View className="flex-1 px-[12px] py-[8px]">
        <View>
          <Text className="text-sm text-[#ADB5BD]">
            Control who can see your trips and invites.
          </Text>

          <View className="mt-20 flex-col gap-y-5">
            {updatedPrivacyOptions.map((data, index) => (
              <RadioButton
                title={data.title}
                subtitle={data.subtitle}
                checked={data.checked}
                setChecked={data.setChecked}
                key={index}
              />
            ))}
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default PrivacySettings;
