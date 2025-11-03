import React from "react";

import { FlashList } from "@shopify/flash-list";
import { FeaturedTrip } from "@/types/trips.types";
import { FeaturedTripCard, Spacer } from "@/components";

const HorizontalCarousel = ({ data }: { data: FeaturedTrip[] }) => {
  console.log("data", data);
  return (
    <FlashList
      data={data}
      renderItem={({ item }: { item: FeaturedTrip }) => (
        <FeaturedTripCard data={item} />
      )}
      keyExtractor={(item: FeaturedTrip) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={() => <Spacer size={16} horizontal />}
    />
  );
};

export default HorizontalCarousel;
