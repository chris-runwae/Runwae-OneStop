import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { EventDetailClient } from "@/components/events/EventDetailClient";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchAuthedQuery(api.events.getBySlug, { slug });
  return { title: result?.event?.name ?? "Event" };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [result, viewer] = await Promise.all([
    fetchAuthedQuery(api.events.getBySlug, { slug }),
    fetchAuthedQuery(api.users.getCurrentUser, {}),
  ]);
  if (!result) notFound();

  return (
    <EventDetailClient
      event={result.event}
      tiers={result.tiers}
      hosts={result.hosts}
      viewer={viewer}
    />
  );
}
