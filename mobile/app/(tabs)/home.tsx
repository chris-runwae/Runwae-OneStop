import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { RelativePathString } from "expo-router";

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
        <UpcomingTripContainer
          linkText="More"
          linkTo={"/explore" as RelativePathString}
        />
        <Spacer size={32} vertical />
        {featuredTrips.length > 0 && (
          <>
            <SectionHeader
              title="Featured Trips"
              linkText="More"
              linkTo={"/explore" as RelativePathString}
            />
            <View style={styles.carouselContainer}>
              <HorizontalCarousel data={featuredTrips} />
            </View>
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
  carouselContainer: {
    marginHorizontal: -16,
    paddingLeft: 16,
  },
});
