import { notFound } from "next/navigation";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { FlightsListClient } from "@/components/flights/FlightsListClient";
import { nearestIata } from "@/lib/iata";

function isoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default async function EventFlightsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    origin?: string;
    dest?: string;
    depart?: string;
    return?: string;
  }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const [result, viewer] = await Promise.all([
    fetchAuthedQuery(api.events.getBySlug, { slug }),
    fetchAuthedQuery(api.users.getCurrentUser, {}),
  ]);
  if (!result) notFound();

  const start = new Date(result.event.startDateUtc);
  const end = new Date(result.event.endDateUtc ?? result.event.startDateUtc);
  const depart = sp.depart ?? isoDate(new Date(start.getTime() - 86_400_000));
  const ret = sp.return ?? isoDate(new Date(end.getTime() + 86_400_000));
  const origin = sp.origin ?? viewer?.homeIata ?? "LHR";
  const destFromCoords = result.event.locationCoords
    ? nearestIata(result.event.locationCoords, result.event.locationName)
    : null;
  const dest = sp.dest ?? destFromCoords ?? "DXB";

  return (
    <FlightsListClient
      initialOrigin={origin}
      initialDest={dest}
      initialDepart={depart}
      initialReturn={ret}
      backHref={`/events/${slug}`}
      eventId={result.event._id}
    />
  );
}
