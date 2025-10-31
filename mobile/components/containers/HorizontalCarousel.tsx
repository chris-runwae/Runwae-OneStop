import { StyleSheet } from "react-native";
import React from "react";

import { FlashList } from "@shopify/flash-list";
import { FeaturedTrip } from "@/types/trips.types";
import { FeaturedTripCard, Text } from "@/components";

const HorizontalCarousel = ({ data }: { data: FeaturedTrip[] }) => {
  return (
    <FlashList
      data={data}
      renderItem={({ item }: { item: FeaturedTrip }) => (
        // <FeaturedTripCard data={item} />
        <Text>{item.title}</Text>
      )}
      keyExtractor={(item: FeaturedTrip) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default HorizontalCarousel;

const styles = StyleSheet.create({});
