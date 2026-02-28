import React from 'react';
import { Text } from 'react-native';
import { COLORS } from '@/constants';

interface SlideHeaderProps {
  title: string;
  subtitle?: string;
  isDarkMode: boolean;
}

export const SlideHeader: React.FC<SlideHeaderProps> = ({
  title,
  subtitle,
  isDarkMode,
}) => {
  return (
    <>
      <Text
        className="mb-2 text-3xl font-bold"
        style={{
          color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
          fontFamily: 'BricolageGrotesque_700Bold',
        }}>
        {title}
      </Text>

      {subtitle && (
        <Text
          className="mb-8 text-base"
          style={{
            color: isDarkMode ? COLORS.gray[400] : COLORS.gray[600],
          }}>
          {subtitle}
        </Text>
      )}
    </>
  );
};
