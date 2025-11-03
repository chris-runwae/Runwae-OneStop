import {
  StyleSheet,
  Pressable,
  View,
  useColorScheme,
  StyleProp,
  ViewStyle,
} from "react-native";
import React from "react";

import { Colors } from "@/constants";
import { Text } from "@/components";

type PrimaryButtonProps = {
  onPress: () => void;
  title: string;
  width?: number;
  style?: StyleProp<ViewStyle>;
};

const PrimaryButton = ({
  onPress,
  title,
  width,
  style,
}: PrimaryButtonProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    button: {
      backgroundColor: colors.primaryColors.default,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      width: width ? width : 343,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: colors.textColors.default,
      fontSize: 13,
      lineHeight: 19.5,
      fontWeight: "bold",
    },
  });

  return (
    <View>
      <Pressable onPress={onPress} style={[styles.button, style]}>
        <Text style={styles.buttonText}>{title}</Text>
      </Pressable>
    </View>
  );
};

export default PrimaryButton;
