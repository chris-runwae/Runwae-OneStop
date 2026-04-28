import { RoomDetailClient } from "@/components/hotels/RoomDetailClient";
import type { Id } from "@/convex/_generated/dataModel";

export const metadata = { title: "Room" };

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ apiRef: string; rateId: string }>;
  searchParams: Promise<{
    checkin?: string;
    checkout?: string;
    adults?: string;
    eventId?: string;
    eventSlug?: string;
  }>;
}) {
  const [{ apiRef, rateId }, sp] = await Promise.all([params, searchParams]);
  const today = new Date();
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  const checkin = sp.checkin ?? fmt(new Date(today.getTime() + 14 * 86_400_000));
  const checkout = sp.checkout ?? fmt(new Date(today.getTime() + 17 * 86_400_000));
  const adults = sp.adults ? Number(sp.adults) : 2;
  const eventId = sp.eventId as Id<"events"> | undefined;
  const decodedApiRef = decodeURIComponent(apiRef);
  const backHref = `/hotels/${apiRef}?checkin=${checkin}&checkout=${checkout}&adults=${adults}${eventId ? `&eventId=${eventId}` : ""}${sp.eventSlug ? `&eventSlug=${sp.eventSlug}` : ""}`;

  return (
    <RoomDetailClient
      apiRef={decodedApiRef}
      rateId={decodeURIComponent(rateId)}
      checkin={checkin}
      checkout={checkout}
      adults={adults}
      eventId={eventId}
      eventSlug={sp.eventSlug}
      backHref={backHref}
    />
  );
}
