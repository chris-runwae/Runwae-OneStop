import React from 'react';
import { Svg, Path } from 'react-native-svg';

export function HomeIcon({ size = 24, color = '#000', strokeWidth = 1.5 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path 
        d="M6.01398 1.89409L2.42065 4.69409C1.82065 5.16076 1.33398 6.15409 1.33398 6.90743V11.8474C1.33398 13.3941 2.59398 14.6608 4.14065 14.6608H11.8607C13.4073 14.6608 14.6673 13.3941 14.6673 11.8541V7.00076C14.6673 6.19409 14.1273 5.16076 13.4673 4.70076L9.34732 1.81409C8.41398 1.16076 6.91398 1.19409 6.01398 1.89409Z" 
        stroke={color} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M8 11.9941V9.99414" 
        stroke={color} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
}
