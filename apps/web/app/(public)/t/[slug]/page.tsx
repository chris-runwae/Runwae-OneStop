import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { PublicTripDetailClient } from "@/components/trips/PublicTripDetailClient";

const SITE_NAME = "Runwae";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchAuthedQuery(api.trips.getPublicShareView, { slug });
  if (!data) {
    return { title: "Trip not found · Runwae" };
  }
  const { trip, itemCount, creator } = data;
  const title = `${trip.title} · ${SITE_NAME}`;
  const destination = trip.destinationLabel ?? "an unforgettable trip";
  const description =
    trip.description?.slice(0, 200) ??
    `${itemCount} activities planned in ${destination}${
      creator?.name ? ` by ${creator.name}` : ""
    }. See the itinerary on Runwae.`;
  const cover = trip.coverImageUrl;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: SITE_NAME,
      url: `/t/${slug}`,
      images: cover ? [{ url: cover, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function PublicTripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await fetchAuthedQuery(api.trips.getPublicShareView, { slug });
  if (!data) notFound();
  return <PublicTripDetailClient slug={slug} initialData={data} />;
}
