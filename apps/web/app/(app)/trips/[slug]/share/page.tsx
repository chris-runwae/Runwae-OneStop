import { notFound } from "next/navigation";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { ShareClient } from "./ShareClient";

export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = await fetchAuthedQuery(api.trips.getBySlug, { slug });
  if (!trip) notFound();
  return <ShareClient trip={trip} />;
}
