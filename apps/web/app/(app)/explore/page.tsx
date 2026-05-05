import type { Metadata } from "next";
import { ExploreClient } from "@/components/explore/ExploreClient";

export const metadata: Metadata = {
  title: "Explore",
  description: "Discover featured destinations, experiences, and events on Runwae.",
};

export default function ExplorePage() {
  return <ExploreClient />;
}
