import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import React from "react";

import { RelativePathString, router } from "expo-router";
import { MoveRight } from "lucide-react-native";
import { Colors } from "@/constants/theme";

export interface ExpandLinkProps {
  linkText?: string;
  linkTo?: RelativePathString;
}

const ExpandLink = ({ linkText, linkTo }: ExpandLinkProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    linkContainer: {
      backgroundColor: colors.primaryColors.background,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: colors.primaryColors.border,
    },

    linkText: {
      color: colors.primaryColors.default,
      fontSize: 11,
      fontWeight: "400",
      fontFamily: "DM Sans",
      lineHeight: 16.5,
      letterSpacing: 0,
    },
  });

  if (!linkTo) {
    return (
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>{linkText}</Text>
        <MoveRight size={12} color={colors.primaryColors.default} />
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => router.push(linkTo!)}
      style={styles.linkContainer}
    >
      <Text style={styles.linkText}>{linkText}</Text>
      <MoveRight size={12} color={colors.primaryColors.default} />
    </Pressable>
  );
};

export default ExpandLink;
