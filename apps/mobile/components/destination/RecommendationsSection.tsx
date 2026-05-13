import DiscoverGrid from "@/components/discover/DiscoverGrid";
import React from "react";
import { View } from "react-native";

interface RecommendationsSectionProps {
  destination: {
    title: string;
    location: string;
    coords?: { lat: number; lng: number };
  };
  /** Reserved for future event-specific saved-item plumbing. */
  eventId?: string;
}

// Thin wrapper over DiscoverGrid so the destination-detail screen and the
// home screen share one taxonomy + data path. The 10 chips minus 'fly'
// (no origin in the destination context) and minus 'attend' (events have
// their own surface) cover what destination Discover used to expose, and
// then some.
const RecommendationsSection = ({
  destination,
}: RecommendationsSectionProps) => {
  return (
    <View className="mt-8">
      <DiscoverGrid
        city={destination.title}
        coords={destination.coords}
        excludeCategories={["fly", "attend"]}
        initialCategory="do"
        heading="Recommendations"
      />
    </View>
  );
};

export default RecommendationsSection;
