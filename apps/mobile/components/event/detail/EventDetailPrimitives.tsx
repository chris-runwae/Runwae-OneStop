import React from 'react';
import { Text, View } from 'react-native';

export const Divider = () => (
  <View className="mx-5 h-[1px] bg-gray-100 dark:bg-white/5" />
);

export const SectionTitle = ({ title }: { title: string }) => (
  <Text
    className="mb-4 text-base font-bold text-gray-900 dark:text-white"
    style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
    {title}
  </Text>
);

export const BulletRow = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <View className="mb-2.5 flex-row items-start gap-x-3">
    <View className="mt-0.5 h-5 w-5 items-center justify-center">{icon}</View>
    <Text className="flex-1 text-sm leading-[22px] text-gray-600 dark:text-gray-300">
      {text}
    </Text>
  </View>
);
