import { StyleSheet, View } from "react-native";
import React from "react";

import useTrips from "@/hooks/useTrips";
import { SectionHeader, Text, ExpandLinkProps } from "@/components";

const UpcomingTripContainer = ({ linkText, linkTo }: ExpandLinkProps) => {
  const { nextTrip } = useTrips();

  if (!nextTrip) {
    return (
      <>
        {" "}
        <Text>User has no trips</Text>
      </>
    );
  }

  return (
    <View>
      <SectionHeader
        title="Upcoming Trip"
        linkText={linkText}
        linkTo={linkTo}
      />
    </View>
  );
};

export default UpcomingTripContainer;

const styles = StyleSheet.create({});
