import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { PublicDestinationDetailClient } from "@/components/destinations/PublicDestinationDetailClient";

const SITE_NAME = "Runwae";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchAuthedQuery(api.destinations.getBySlug, { slug });
  if (!data) return { title: "Destination not found · Runwae" };
  const { destination } = data;
  const title = `${destination.name}, ${destination.country} · ${SITE_NAME}`;
  const description =
    destination.description?.slice(0, 200) ??
    `Plan your trip to ${destination.name}, ${destination.country}. Stays, experiences and ready-made itineraries on Runwae.`;
  const cover = destination.heroImageUrl;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: SITE_NAME,
      url: `/d/${slug}`,
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

export default async function PublicDestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await fetchAuthedQuery(api.destinations.getBySlug, { slug });
  if (!data) notFound();
  return <PublicDestinationDetailClient slug={slug} initialData={data} />;
}
