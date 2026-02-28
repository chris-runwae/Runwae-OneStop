/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform, TextStyle } from 'react-native';
import { useFonts } from 'expo-font';
import { BricolageGrotesque_700Bold, BricolageGrotesque_600SemiBold, BricolageGrotesque_500Medium, BricolageGrotesque_400Regular } from '@expo-google-fonts/bricolage-grotesque';
import { DMSans_700Bold, DMSans_600SemiBold, DMSans_500Medium, DMSans_400Regular } from '@expo-google-fonts/dm-sans';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#FF2E92',
    borderDefault: '#E9ECEF',
    textBody: '#6C757D',
    textHeading: '#0D0F12',
    textSubtle: '#ADB5BD',
    textSubtitle: '#A8A8A8',
    iconDefault: '#343A40',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#FF2E92',
    borderDefault: '#E9ECEF',
    textBody: '#6C757D',
    textHeading: '#0D0F12',
    textSubtle: '#ADB5BD',
    textSubtitle: '#A8A8A8',
    iconDefault: '#343A40',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const textStyles: Record<string, TextStyle> = {
  textHeading20: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: Colors.light.textHeading,
    lineHeight: 24,
    letterSpacing: 0,
  },
  textHeading16: {
    fontFamily: 'BricolageGrotesque_600SemiBold',
    fontSize: 16,
    color: Colors.light.textHeading,
    lineHeight: 20,
    letterSpacing: 0,
  },
  textBody12: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.light.textSubtle,
    lineHeight: 16,
    letterSpacing: 0,
  },
  textBody14: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.light.textBody,
    lineHeight: 18,
    letterSpacing: 0,
  },
}
