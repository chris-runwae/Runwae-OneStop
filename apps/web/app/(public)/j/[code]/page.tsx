import type { Metadata } from "next";
import { JoinTripClient } from "@/components/trips/JoinTripClient";

export const metadata: Metadata = { title: "Join trip · Runwae" };

export default async function JoinTripPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <JoinTripClient joinCode={code} />;
}
