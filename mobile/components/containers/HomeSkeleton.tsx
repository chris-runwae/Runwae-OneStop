import { StyleSheet, Pressable, View, useColorScheme } from "react-native";
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";

import { COLORS } from "@/constants";

export default function HomeSkeleton() {
  const colorMode = useColorScheme() ?? "light";
  const dark = colorMode === "dark";

  return (
    <Pressable onPress={() => {}} style={styles.container}>
      <MotiView
        transition={{
          type: "timing",
        }}
        style={[styles.container, styles.padded]}
        animate={{
          backgroundColor: dark ? COLORS.black.default : COLORS.white.default,
        }}
      >
        <Skeleton colorMode={colorMode} radius="round" height={75} width={75} />
        <Spacer />
        <Skeleton colorMode={colorMode} width={250} />
        <Spacer height={8} />
        <Skeleton colorMode={colorMode} width={"100%"} />
        <Spacer height={8} />
        <Skeleton colorMode={colorMode} width={"100%"} />
      </MotiView>
    </Pressable>
  );
}

const Spacer = ({ height = 16 }) => <View style={{ height }} />;

const styles = StyleSheet.create({
  shape: {
    justifyContent: "center",
    height: 250,
    width: 250,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  padded: {
    padding: 16,
  },
});
