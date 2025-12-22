import React from 'react';
import { useColorScheme } from 'react-native';
import Svg, { Path, ClipPath, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

export interface StarProps {
  percentage?: number;
  size?: number;
}
export default function Star({ percentage = 0, size = 32 }: StarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const fillWidth = 24 * Math.max(0, Math.min(1, percentage));
  // const strokeColor = percentage > 0 ? '#FBBF24' : '#CCCCCC';
  const strokeColor =
    percentage > 0 ? colors.textColors.default : colors.borderColors.default;
  const fillColor =
    percentage > 0 ? colors.textColors.default : colors.borderColors.default;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <ClipPath id={`fillClip-${percentage}`}>
        <Rect x="0" y="0" width={fillWidth} height="24" />
      </ClipPath>

      <Path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        // fill="#FBBF24"
        fill={fillColor}
        clipPath={`url(#fillClip-${percentage})`}
      />

      <Path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill="transparent"
        stroke={strokeColor}
        strokeWidth="1"
      />
    </Svg>
  );
}
