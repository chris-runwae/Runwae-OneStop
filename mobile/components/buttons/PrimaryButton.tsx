import {
  StyleSheet,
  Pressable,
  useColorScheme,
  StyleProp,
  ViewStyle,
} from "react-native";
import React from "react";

import { Colors, COLORS } from "@/constants";
import { Text } from "@/components";

type PrimaryButtonProps = {
  onPress: () => void;
  title: string;
  width?: number;
  style?: StyleProp<ViewStyle>;
  rounded?: boolean;
};

const PrimaryButton = ({
  onPress,
  title,
  width,
  style,
  rounded,
}: PrimaryButtonProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    button: {
      backgroundColor: colors.primaryColors.default,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: rounded ? 100 : 8,
      width: width ? width : "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: COLORS.white.base,
      fontSize: 13,
      lineHeight: 19.5,
      fontWeight: "bold",
    },
  });

  return (
    <Pressable onPress={onPress} style={[styles.button, style]}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
};

export default PrimaryButton;
