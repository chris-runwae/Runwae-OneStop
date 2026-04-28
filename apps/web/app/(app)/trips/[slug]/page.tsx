import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { TripDetailClient } from "@/components/trips/TripDetailClient";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const trip = await fetchAuthedQuery(api.trips.getBySlug, { slug });
  return { title: trip?.title ?? "Trip" };
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [trip, viewer] = await Promise.all([
    fetchAuthedQuery(api.trips.getBySlug, { slug }),
    fetchAuthedQuery(api.users.getCurrentUser, {}),
  ]);

  if (!trip) {
    // getBySlug returns null in two cases:
    //   1. trip doesn't exist
    //   2. trip is private/invite_only and viewer isn't a member
    // If we have no viewer, signing in might unlock case 2 — send to sign-in.
    if (!viewer) redirect(`/sign-in?next=/trips/${slug}`);
    notFound();
  }

  return <TripDetailClient slug={slug} initialTrip={trip} />;
}
