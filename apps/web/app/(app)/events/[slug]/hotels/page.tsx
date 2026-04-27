import { notFound } from "next/navigation";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { HotelsListClient } from "@/components/hotels/HotelsListClient";

function isoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default async function EventHotelsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ checkin?: string; checkout?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const result = await fetchAuthedQuery(api.events.getBySlug, { slug });
  if (!result) notFound();

  const start = new Date(result.event.startDateUtc);
  const end = new Date(result.event.endDateUtc ?? result.event.startDateUtc);
  const checkin = sp.checkin ?? isoDate(new Date(start.getTime() - 86_400_000));
  const checkout = sp.checkout ?? isoDate(new Date(end.getTime() + 86_400_000));
  const city =
    result.event.locationName.split(",")[0]?.trim() ?? result.event.locationName;

  return (
    <HotelsListClient
      initialCheckin={checkin}
      initialCheckout={checkout}
      city={city}
      coords={result.event.locationCoords}
      backHref={`/events/${slug}`}
      eventId={result.event._id}
      eventSlug={slug}
    />
  );
}
