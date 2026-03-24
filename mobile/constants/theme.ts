/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform, TextStyle } from 'react-native';

const ios = Platform.OS === 'ios';

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
    300: '#F8F9FA',
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
    light: '#FFE9EA',
    medium: '#C31D1D',
    bright: '#DA2020',
    base: '#FF0000',
    pale: '#FFB6B6',
    lighter: '#FFC5C5',
    dangerBorder: '#D30200',
    required: '#F61801',
  },
  pink: {
    default: '#FF2E92',
    light: '#FFF0F4',
    lightForDark: '#FF96BA',
    border: '#FF96BA',
    dark: '#FF48A0',
    darkBackground: '#FFF0F4',
    // darkBorder: "#FF96BA",
  },
};

export const addOpacity = (hex: string, opacity: number): string => {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${alpha}`;
};

export const Colors = {
  light: {
    // text: '#11181C',
    // background: '#fff',
    white: COLORS.white.base,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#FF2E92',
    borderDefault: '#F8F9FA',
    textBody: '#212529',
    textHeading: '#FFFFFF',
    textSubtle: '#6C757D',
    textSubtitle: '#6C757D',
    iconDefault: '#212529',

    //variable names
    background: COLORS.white.base,
    card: COLORS.white.default,
    text: COLORS.black.default,
    backgroundColors: {
      default: COLORS.white.default,
      subtle: COLORS.gray[300],
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
    destructiveColors: {
      default: COLORS.red.required,
      background: COLORS.red.light,
      border: COLORS.red.dangerBorder,
    },
    secondary: COLORS.gray[700],
    border: COLORS.gray[400],
    placeholder: COLORS.gray[500],
    notification: COLORS.red.bright,
    required: COLORS.red.required,
  },
  dark: {
    // text: '#ECEDEE',
    // background: '#151718',
    white: COLORS.white.base,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#FF2E92',
    borderDefault: '#E9ECEF',
    textBody: '#6C757D',
    textHeading: '#E9ECEF',
    textSubtle: '#ADB5BD',
    textSubtitle: '#A8A8A8',
    iconDefault: '#343A40',

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
      background: addOpacity(COLORS.pink.light, 0.3),
      border: COLORS.pink.border,
    },
    destructiveColors: {
      default: COLORS.red.dangerBorder,
      background: COLORS.red.dark,
      border: COLORS.red.dangerBorder,
    },
    secondary: COLORS.gray[500],
    border: COLORS.gray[750],
    placeholder: COLORS.gray[600],
    notification: COLORS.red.bright,
    required: COLORS.red.required,
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

export const AppFonts = {
  bricolage: {
    light: ios ? 'BricolageGrotesque-Light' : 'BricolageGrotesque_300Light',
    regular: ios
      ? 'BricolageGrotesque-Regular'
      : 'BricolageGrotesque_400Regular',
    medium: ios ? 'BricolageGrotesque-Medium' : 'BricolageGrotesque_500Medium',
    semiBold: ios
      ? 'BricolageGrotesque-SemiBold'
      : 'BricolageGrotesque_600SemiBold',
    bold: ios ? 'BricolageGrotesque-Bold' : 'BricolageGrotesque_700Bold',
    extraBold: ios
      ? 'BricolageGrotesque-ExtraBold'
      : 'BricolageGrotesque_800ExtraBold',
  },
  inter: {
    thin: ios ? 'Inter-Thin' : 'Inter_100Thin',
    light: ios ? 'Inter-Light' : 'Inter_300Light',
    regular: ios ? 'Inter-Regular' : 'Inter_400Regular',
    medium: ios ? 'Inter-Medium' : 'Inter_500Medium',
    semiBold: ios ? 'Inter-SemiBold' : 'Inter_600SemiBold',
    bold: ios ? 'Inter-Bold' : 'Inter_700Bold',
    extraBold: ios ? 'Inter-ExtraBold' : 'Inter_800ExtraBold',
    black: ios ? 'Inter-Black' : 'Inter_900Black',
  },
} as const;

export const textStyles: Record<string, TextStyle> = {
  textHeading20: {
    fontFamily: AppFonts.bricolage.bold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0,
  },
  textHeading16: {
    fontFamily: AppFonts.bricolage.semiBold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
  },
  textBody12: {
    fontFamily: AppFonts.inter.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  textBody14: {
    fontFamily: AppFonts.inter.regular,
    fontSize: 14,
    lineHeight: 19.5,
    letterSpacing: 0,
  },
};

export const sharedShadowStyles = {
  shadowColor: '#3E3445',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
};
