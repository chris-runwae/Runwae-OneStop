/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const COLORS = {
  black: {
    default: '#000000',
    subtle: '#1A1A1A',
    base: '#000000',
    dark: '#0D0D0D',
    dark950: '#131313',
    dark900: '#171717',
    dark880: '#1E1E1E',
    dark870: '#1F1F1F',
  },
  gray: {
    900: '#222222',
    800: '#333333',
    750: '#3B3B3B',
    740: '#3C3C3C',
    700: '#575757',
    650: '#747474',
    600: '#878787',
    550: '#A8A8A8',
    500: '#BFBFBF',
    490: '#BEBEBE',
    450: '#D4D4D4',
    440: '#D9D9D9',
    400: '#E4E4E4',
    390: '#E8E8E8',
    380: '#EDEDED',
    360: '#F0F0F0',
    350: '#FAFAFA',
    300: '#F5F5F5',
    200: '#E5E5E5',
    100: '#D4D4D4',
    50: '#C4C4C4',
    10: '#B4B4B4',
    5: '#A4A4A4',
    1: '#949494',
    0: '#848484',
  },
  white: {
    base: '#FFFFFF',
    default: '#FFFFFF',
    translucent13: '#FFFFFF21',
    translucent36: '#FFFFFF5C',
    translucent43: '#FFFFFF6E',
    translucent26: '#FFFFFF42',
  },
  red: {
    dark: '#4E1010',
    light: '#F4C6C6',
    medium: '#C31D1D',
    bright: '#DA2020',
    base: '#FF0000',
    pale: '#FFB6B6',
    lighter: '#FFC5C5',
    dangerBorder: '#D30200',
  },
  pink: {
    default: '#FF2E92',
    light: '#FFF0F4',
    border: '#FF96BA',
    dark: '#FF48A0',
    darkBackground: '#FFF0F4',
    // darkBorder: "#FF96BA",
  },
};

export const Colors = {
  light: {
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

    //variable names
    background: COLORS.white.base,
    card: COLORS.white.default,
    text: COLORS.black.default,
    backgroundColors: {
      default: COLORS.white.default,
      subtle: COLORS.gray[350],
    },
    textColors: {
      default: COLORS.black.default,
      subtle: COLORS.gray[750],
      subtitle: COLORS.gray[550],
    },
    borderColors: {
      default: COLORS.gray[750],
      subtle: COLORS.gray[380],
    },
    primaryColors: {
      default: COLORS.pink.default,
      background: COLORS.pink.light,
      border: COLORS.pink.border,
    },
    primary: COLORS.red.medium,
    secondary: COLORS.gray[700],
    border: COLORS.gray[400],
    placeholder: COLORS.gray[500],
    notification: COLORS.red.bright,
  },
  dark: {
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

    //variable names
    background: COLORS.black.dark900,
    card: COLORS.black.dark880,
    text: COLORS.white.base,
    textColors: {
      default: COLORS.white.base,
      subtle: COLORS.gray[650],
      subtitle: COLORS.gray[450],
    },
    backgroundColors: {
      default: COLORS.black.default,
      subtle: COLORS.black.subtle,
    },
    borderColors: {
      default: COLORS.gray[750],
      subtle: COLORS.gray[750],
    },
    primaryColors: {
      default: COLORS.pink.dark,
      background: COLORS.pink.darkBackground,
      border: COLORS.pink.border,
    },
    primary: COLORS.red.medium,
    secondary: COLORS.gray[500],
    border: COLORS.gray[750],
    placeholder: COLORS.gray[600],
    notification: COLORS.red.bright,
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
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
