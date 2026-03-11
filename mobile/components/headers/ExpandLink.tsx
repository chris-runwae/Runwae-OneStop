import { Pressable, Text, View, useColorScheme } from 'react-native';
import React from 'react';

import { RelativePathString, router } from 'expo-router';
import { MoveRight } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export interface ExpandLinkProps {
  linkText?: string;
  linkTo?: RelativePathString;
}

const ExpandLink = ({ linkText, linkTo }: ExpandLinkProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const containerClasses = [
    'flex-row items-center gap-1.5 py-1 px-3 rounded-full border',
    'bg-[#420021] border-[#FF2E92]',
  ].join(' ');

  const textClasses = [
    'text-xs',
    'text-[#FF2E92]',
    'font-normal',
    'font-[DM_Sans]',
    'leading-[16.5px]',
    'tracking-normal',
  ].join(' ');

  if (!linkTo) {
    return;
  }

  return (
    <Pressable
      onPress={() => router.push(linkTo!)}
      className={containerClasses}>
      <Text className={textClasses}>{linkText}</Text>
    </Pressable>
  );
};

export default ExpandLink;
