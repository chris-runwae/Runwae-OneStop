import { Pressable, StyleSheet, Text, useColorScheme } from "react-native";
import React from "react";
import { BellIcon, ArrowLeft, ArrowRight } from "lucide-react-native";

import { Colors, IconNameType, ICON_NAMES } from "@/constants";

type IconButtonProps = {
  icon: IconNameType;
  onPress: () => void;
  bordered?: boolean;
  size?: number;
};

const IconButton = ({
  icon,
  onPress,
  bordered = false,
  size = 25,
}: IconButtonProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      padding: 10,
      backgroundColor: "transparent",
      ...(bordered && {
        borderWidth: 1,
        borderColor: colors.borderColors.default,
        borderRadius: 99,
      }),
    },
  });

  const getIcon = () => {
    if (typeof icon === "string") {
      switch (icon) {
        case ICON_NAMES.BELL:
          return <BellIcon size={size} color={colors.text} />;
        case ICON_NAMES.ARROW_LEFT:
          return <ArrowLeft size={size} color={colors.text} />;
        case ICON_NAMES.ARROW_RIGHT:
          return <ArrowRight size={size} color={colors.text} />;
        default:
          return <></>;
      }
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {getIcon()}
    </Pressable>
  );
};

export default IconButton;
