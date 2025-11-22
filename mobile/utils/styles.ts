import { TextStyle } from 'react-native';

export const appColors = {
  purple: '#3E63DD',
  lightPurple: 'rgba(62, 99, 221, 0.28)',
  grey: '#ECEBEB',
  grey2: '#686868',
  grey3: '#454545',
  grey4: '#333333',
  grey5: '#636363',
  black: '#33363F',
  textBlack: '#252525',
  textGrey: '#747272',
  textH1: '#4B4B4B',
  pitchBlack: '#1C1C1C',
  pureBlack: '#000000',
  white: '#FFFFFF',
  gradientOne: '#3B82F6',
  gradientTwo: '#1E3A8A',
  gradientOrange: '#EA5809',
  dedede: '#DEDEDE',
};

export const textStyles: Record<string, TextStyle> = {
  medium_22: {
    fontSize: 22,
    fontFamily: 'Space Grotesk',
    color: appColors.textH1,
  },
  medium_17: {
    fontSize: 17,
    fontFamily: 'Space Grotesk',
    color: appColors.pitchBlack,
  },
  medium_8: {
    fontSize: 8,
    fontFamily: 'Space Grotesk',
  },
  regular_8: {
    fontSize: 8,
    fontFamily: 'Space Grotesk',
    color: appColors.grey2,
  },
  regular_10: {
    fontSize: 10,
    fontFamily: 'Space Grotesk',
  },
  regular_12: {
    fontSize: 12,
    fontFamily: 'Space Grotesk',
  },
  regular_14: {
    fontSize: 14,
    fontFamily: 'Space Grotesk',
  },

  //Post Hannefah
  bold_20: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0,
  },
  body_Bold: {
    fontFamily: 'DMSans_400Regular',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  subtitle_Regular: {
    fontFamily: 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 19.5,
    letterSpacing: 0,
  },
  footnote_Bold: {
    fontFamily: 'DMSans_400Regular',
    fontWeight: '900',
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.08, // 8% as decimal
    textAlign: 'right',
    textTransform: 'uppercase',
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
