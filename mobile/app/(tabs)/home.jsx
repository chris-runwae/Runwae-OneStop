import { ScrollView, StyleSheet } from "react-native";

import {
  IconButton,
  ScreenContainer,
  Spacer,
  WelcomeAvatar,
  UpcomingTripContainer,
} from "@/components";
// import useTrips from "@/hooks/useTrips";
import { ICON_NAMES } from "@/constants";

export default function HomeScreen2() {
  // const { trips, nextTrip } = useTrips();

  return (
    <ScreenContainer
      header={{
        rightComponent: (
          <IconButton
            icon={ICON_NAMES.BELL}
            onPress={() => console.log("Notifications")}
          />
        ),
        leftComponent: <WelcomeAvatar />,
      }}
    >
      {/* <SectionHeader title="Welcome!" linkText="View all" linkTo="/explore" /> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <Spacer size={16} vertical />
        <UpcomingTripContainer linkText="More" linkTo="/explore" />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
  },
});
