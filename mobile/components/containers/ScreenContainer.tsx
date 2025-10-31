import React from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BellIcon } from "lucide-react-native";
import { Colors } from "@/constants";
import { Text } from "@/components";

type ScreenContainerProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  header?: {
    rightComponent?: React.ReactNode;
    title?: string;
    leftComponent?: React.ReactNode;
  };
};

const ScreenContainer = ({ children, style, header }: ScreenContainerProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    //Container
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].white,
      paddingTop: insets.top + 10,
    },

    //Header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    rightComponent: {
      flex: 1,
      alignItems: "flex-end",
    },
    leftComponent: {
      flex: 1,
      alignItems: "flex-start",
    },
    headerTitle: {
      fontFamily: "Space Grotesk",
      fontWeight: "500",
      fontSize: 25,
      lineHeight: 30,
      letterSpacing: 0,
    },
    svgContainer: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].headerGrey,
      height: 50,
      aspectRatio: 1,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
    },

    //Content
    content: {
      flex: 1,
      // paddingHorizontal: 15,
      backgroundColor: Colors[colorScheme].backgroundColor,
    },
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.leftComponent}>
          {header?.leftComponent ? (
            header?.leftComponent
          ) : (
            <Text style={styles.headerTitle}>{header?.title ?? "Home"}</Text>
          )}
        </View>

        <View style={styles.rightComponent}>
          {header?.rightComponent ? (
            header?.rightComponent
          ) : (
            <View style={styles.svgContainer}>
              <BellIcon size={20} color={colors.headerIcon} />
            </View>
          )}
        </View>
      </View>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {children}
      </View>
    </View>
  );
};

export default ScreenContainer;
