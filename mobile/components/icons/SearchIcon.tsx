import React from 'react';
import { Svg, Path } from 'react-native-svg';

export function SearchIcon({ size = 24, color = '#000', strokeWidth = 1.5 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path 
        d="M7.33398 13.334C10.6477 13.334 13.334 10.6477 13.334 7.33398C13.334 4.02028 10.6477 1.33398 7.33398 1.33398C4.02028 1.33398 1.33398 4.02028 1.33398 7.33398C1.33398 10.6477 4.02028 13.334 7.33398 13.334Z" 
        stroke={color} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M12.6196 13.7939C12.973 14.8605 13.7796 14.9672 14.3996 14.0339C14.9663 13.1805 14.593 12.4805 13.5663 12.4805C12.8063 12.4739 12.3796 13.0672 12.6196 13.7939Z" 
        stroke={color} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
}
