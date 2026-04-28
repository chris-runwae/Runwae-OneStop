import type { Metadata } from "next";
import { EventsListingClient } from "@/components/events/EventsListingClient";

export const metadata: Metadata = {
  title: "Events",
  description: "Festivals, gigs, gatherings and travel events on Runwae.",
};

export default function EventsPage() {
  return <EventsListingClient />;
}
