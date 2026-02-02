import { ScreenContainer } from '@/components';
import Switch from '@/components/ui/switch';
import { notificationCenterOptions } from '@/constants/profile/notification-center.constant';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

const NotificationCenter = () => {
  const [notificationOptions, setNotificationOptions] = useState(
    notificationCenterOptions
  );

  const handleToggle = (index: number, checked: boolean) => {
    const updatedOptions = [...notificationOptions];
    updatedOptions[index] = { ...updatedOptions[index], checked };
    setNotificationOptions(updatedOptions);
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
            Choose how you want to stay in the loop from app alerts to trip
            updates and exclusive travel offers.
          </Text>

          <View className="mt-10 flex-col gap-y-10">
            {notificationOptions.map((data, index) => (
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

export default NotificationCenter;
