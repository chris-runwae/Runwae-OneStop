import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface RadioButtonProps {
  title: string;
  subtitle: string;
  checked: boolean;
  setChecked: (checked: boolean) => void;
}

const RadioButton = ({
  title,
  subtitle,
  checked,
  setChecked,
}: RadioButtonProps) => {
  return (
    <Pressable
      onPress={() => setChecked(!checked)}
      className={`flex w-full flex-row items-center gap-4 px-[12px] py-[16px] ${checked ? 'border-[#FFBDD1] bg-[#FFF0F4] dark:border-pink-800 dark:bg-[#500724]/20' : 'border-[#E9ECEF] bg-transparent dark:border-gray-500/60'}`}
      style={{
        borderWidth: 1,
      }}>
      <View
        className={`flex h-[25px] w-[25px] items-center justify-center rounded-full border-[1px] ${checked ? 'border-[#FF2E92]' : 'border-[#E9ECEF] dark:border-gray-500/60'}`}>
        {checked && (
          <View className="h-[15px] w-[15px] rounded-full bg-[#FF2E92]"></View>
        )}
      </View>
      <View>
        <Text
          className={`text-base font-semibold ${checked ? 'text-[#FF2E92]' : 'text-black dark:text-white'}`}>
          {title}
        </Text>
        <Text
          className={`text-sm ${checked ? 'text-[#FF2E92]' : 'text-[#6C757D]'}`}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
};

export default RadioButton;
