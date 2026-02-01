import { ScreenContainer } from '@/components';
import Switch from '@/components/ui/switch';
import { twoFaOptionProps } from '@/constants/profile/security.constant';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

const TwoFactorAuth = () => {
  const [twoFaOptions, setTwoFaOptions] = useState(twoFaOptionProps);

  const handleToggle = (index: number, checked: boolean) => {
    const updatedOptions = [...twoFaOptions];
    updatedOptions[index] = { ...updatedOptions[index], checked };
    setTwoFaOptions(updatedOptions);
  };

  const OptionButtons = ({
    title,
    subtitle,
    checked,
    setChecked,
  }: {
    title: string;
    subtitle: string;
    checked: boolean;
    setChecked: (checked: boolean) => void;
  }) => {
    return (
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-black dark:text-white">
            {title}
          </Text>
          <Text className="text-sm text-[#ADB5BD]">{subtitle}</Text>
        </View>

        <Switch
          checked={checked}
          onValueChange={(checked) => {
            setChecked(checked);
          }}
        />
      </View>
    );
  };

  return (
    <ScreenContainer leftComponent={true} className="flex-1 px-[12px] py-[8px]">
      <View className="flex-1 px-[12px] py-[8px]">
        <View>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Manage your 2-Factor Authentication (2FA) settings to enhance your
            account security.
          </Text>

          <View className="mt-10 flex-col gap-y-10">
            {twoFaOptions.map((data, index) => (
              <OptionButtons
                title={data.title}
                subtitle={data.subtitle}
                key={index}
                checked={data.checked}
                setChecked={(checked) => handleToggle(index, checked)}
              />
            ))}
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default TwoFactorAuth;
