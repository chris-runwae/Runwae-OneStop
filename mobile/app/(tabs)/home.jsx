import { Image } from "expo-image";
import { StyleSheet, useColorScheme } from "react-native";
import { BellIcon } from "lucide-react-native";

import { HelloWave } from "@/components/hello-wave";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { SectionHeader, ScreenContainer } from "@/components";
import useTrips from "@/hooks/useTrips";
import { Colors } from "@/constants";

export default function HomeScreen2() {
  const colorScheme = useColorScheme() ?? "light";
  const { trips, nextTrip } = useTrips();
  // console.log('Next Trip: ', JSON.stringify(nextTrip));

  return (
    <ScreenContainer
      header={{
        rightComponent: (
          <BellIcon size={20} color={Colors[colorScheme].headerIcon} />
        ),
      }}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      <SectionHeader title="Welcome!" linkText="View all" linkTo="/explore" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
