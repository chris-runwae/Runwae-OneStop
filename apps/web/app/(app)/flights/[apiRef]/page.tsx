import { FlightDetailClient } from "@/components/flights/FlightDetailClient";
import type { Id } from "@/convex/_generated/dataModel";

export const metadata = { title: "Flight" };

export default async function FlightDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ apiRef: string }>;
  searchParams: Promise<{ eventId?: string; eventSlug?: string }>;
}) {
  const [{ apiRef }, sp] = await Promise.all([params, searchParams]);
  const eventId = sp.eventId as Id<"events"> | undefined;
  const backHref = sp.eventSlug ? `/events/${sp.eventSlug}/flights` : "/explore";
  return (
    <FlightDetailClient
      apiRef={decodeURIComponent(apiRef)}
      eventId={eventId}
      backHref={backHref}
    />
  );
}
