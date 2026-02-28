import { StyleSheet, Text as RNText, TextProps } from "react-native";
import React from "react";

type CustomTextProps = TextProps & {
  children: string | React.ReactNode;
};

const Text = (props: CustomTextProps) => {
  const { children, ...rest } = props;

  return (
    <RNText {...rest}>{children}</RNText>
  );
};

export default Text;

// const styles = StyleSheet.create({});