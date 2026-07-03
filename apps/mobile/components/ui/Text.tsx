import {
  StyleSheet,
  Text as RNText,
  TextProps,
  useColorScheme,
  StyleProp,
  TextStyle,
} from 'react-native';
import React from 'react';
import { Colors, textStyles, AppFonts } from '@/constants';

type CustomTextProps = TextProps & {
  children: string | React.ReactNode;
  style?: StyleProp<TextStyle>;
  className?: string;
  replaceDefaultStyle?: boolean;
  isHeader?: boolean;
};

const Text = (props: CustomTextProps) => {
  const {
    children,
    style,
    className,
    replaceDefaultStyle = false,
    isHeader = false,
    ...rest
  } = props;
  const colorScheme = useColorScheme() ?? 'light';
  // @ts-ignore
  const colors = Colors[colorScheme ?? 'light'];

  const styles = StyleSheet.create({
    text: {
      ...textStyles.textBody14,
      color: colors.textColors.default,
      fontFamily: isHeader ? AppFonts.bricolage.semiBold : AppFonts.inter.regular
    },
  });

  return (
    <RNText
      style={[replaceDefaultStyle ? {} : styles.text, style]}
      className={className}
      {...rest}>
      {children}
    </RNText>
  );
};

export default Text;
