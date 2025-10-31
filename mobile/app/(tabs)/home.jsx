import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";

import {
  IconButton,
  HorizontalCarousel,
  ScreenContainer,
  SectionHeader,
  Spacer,
  WelcomeAvatar,
  UpcomingTripContainer,
} from "@/components";
import useTrips from "@/hooks/useTrips";
import { COLORS, ICON_NAMES } from "@/constants";

export default function HomeScreen2() {
  const { featuredTrips, loading } = useTrips();

  console.log("featuredTrips", featuredTrips);

  if (loading) {
    return (
      <ScreenContainer header={{ leftComponent: <WelcomeAvatar /> }}>
        <ActivityIndicator size="large" color={COLORS.pink.default} />
      </ScreenContainer>
    );
  }

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <Spacer size={32} vertical />
        <UpcomingTripContainer linkText="More" linkTo="/explore" />
        <Spacer size={32} vertical />
        {featuredTrips.length > 0 && (
          <>
            <SectionHeader
              title="Featured Trips"
              linkText="More"
              linkTo="/explore"
            />
            <HorizontalCarousel data={featuredTrips} />
          </>
        )}
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
