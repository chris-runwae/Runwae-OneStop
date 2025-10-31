import {
  StyleSheet,
  Text as RNText,
  TextProps as RNTextProps,
  StyleProp,
  TextStyle,
  useColorScheme,
} from "react-native";
import React from "react";
import { Colors } from "@/constants";

type TextProps = RNTextProps & {
  style?: StyleProp<TextStyle>;
  children?: string | React.ReactNode;
};
const Text = (props: TextProps) => {
  const { style, children, ...rest } = props;
  const colorScheme = useColorScheme() ?? "light";

  const styles = StyleSheet.create({
    text: {
      color: Colors[colorScheme].text,
    },
  });

  return (
    <RNText style={[styles.text, style]} {...rest}>
      {children}
    </RNText>
  );
};

export default Text;
