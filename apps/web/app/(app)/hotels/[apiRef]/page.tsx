import { HotelDetailClient } from "@/components/hotels/HotelDetailClient";
import type { Id } from "@/convex/_generated/dataModel";

export const metadata = { title: "Hotel" };

export default async function HotelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ apiRef: string }>;
  searchParams: Promise<{
    checkin?: string;
    checkout?: string;
    adults?: string;
    eventId?: string;
    eventSlug?: string;
  }>;
}) {
  const [{ apiRef }, sp] = await Promise.all([params, searchParams]);
  const today = new Date();
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  const checkin = sp.checkin ?? fmt(new Date(today.getTime() + 14 * 86_400_000));
  const checkout = sp.checkout ?? fmt(new Date(today.getTime() + 17 * 86_400_000));
  const adults = sp.adults ? Number(sp.adults) : 2;
  const eventId = sp.eventId as Id<"events"> | undefined;
  const backHref = sp.eventSlug
    ? `/events/${sp.eventSlug}/hotels?checkin=${checkin}&checkout=${checkout}`
    : "/explore";

  return (
    <HotelDetailClient
      apiRef={decodeURIComponent(apiRef)}
      initialCheckin={checkin}
      initialCheckout={checkout}
      initialAdults={adults}
      eventId={eventId}
      eventSlug={sp.eventSlug}
      backHref={backHref}
    />
  );
}
