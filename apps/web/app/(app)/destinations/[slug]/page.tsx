import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { DestinationDetailClient } from "@/components/destinations/DestinationDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchAuthedQuery(api.destinations.getBySlug, { slug });
  if (!data) return { title: "Destination" };
  return {
    title: `${data.destination.name}, ${data.destination.country}`,
    description: data.destination.description,
  };
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await fetchAuthedQuery(api.destinations.getBySlug, { slug });
  if (!data) notFound();

  return <DestinationDetailClient slug={slug} initialData={data} />;
}
