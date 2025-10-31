/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

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

    //Hannefah's Colors
    black: '#000000',
    white: '#FFFFFF',
    textBlack: '#0A071A',
    pink500: '#FF2E92', //Move this to colors palette later
    secondaryText: '#ABACB9',
    shadow: '#3E3445',
    borderGray: '#E7E8EE',
    backgroundColor: '#F6F6F9',
    headerText: '#212134',
    headerGrey: '#EAEAEF',
    headerIcon: '#C0C0CF',
    imageOverlay: '#00000073', //rgba(0, 0, 0, 0.45)
    imageOverlay35: '#00000059', //rgba(0, 0, 0, 0.35)
    iconBorderGrey: '#A5A5BA',
    pillBorderGrey: '#878787',
    greyBackgroundBorder: '#DCDCE4',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    //Hannefah's Colors
    black: '#000000',
    white: '#FFFFFF',
    textBlack: '#0A071A',
    pink500: '#FF2E92', //Move this to colors palette later
    secondaryText: '#ABACB9',
    shadow: '#3E3445',
    borderGray: '#E7E8EE',
    backgroundColor: '#F6F6F9',
    headerText: '#212134',
    headerGrey: '#EAEAEF',
    headerIcon: '#C0C0CF',
    imageOverlay: '#00000073', //rgba(0, 0, 0, 0.45)
    imageOverlay35: '#00000059', //rgba(0, 0, 0, 0.35)
    iconBorderGrey: '#A5A5BA',
    pillBorderGrey: '#878787',
    greyBackgroundBorder: '#DCDCE4',
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
