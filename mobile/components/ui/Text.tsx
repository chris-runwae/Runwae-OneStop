import {
  StyleSheet,
  Text as RNText,
  TextProps,
  useColorScheme,
  StyleProp,
  TextStyle,
} from 'react-native';
import React from 'react';
import { Colors, textStyles } from '@/constants';

type CustomTextProps = TextProps & {
  children: string | React.ReactNode;
  style?: StyleProp<TextStyle>;
};

const Text = (props: CustomTextProps) => {
  const { children, style, ...rest } = props;
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme ?? 'light'];

  const styles = StyleSheet.create({
    text: {
      color: colors.textColors.default,
      ...textStyles.textBody14,
    },
  });

  return (
    <RNText style={[styles.text, style]} {...rest}>
      {children}
    </RNText>
  );
};

export default Text;
