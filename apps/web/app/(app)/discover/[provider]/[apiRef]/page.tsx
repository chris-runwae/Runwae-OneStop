import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailClient } from "./DetailClient";

export const metadata: Metadata = { title: "Details" };

export default async function DiscoveryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ provider: string; apiRef: string }>;
  searchParams: Promise<{ category?: string; tripId?: string }>;
}) {
  const { provider, apiRef } = await params;
  const sp = await searchParams;
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-foreground/5" />}>
        <DetailClient
          provider={provider}
          apiRef={decodeURIComponent(apiRef)}
          category={sp.category ?? "other"}
          tripId={sp.tripId}
        />
      </Suspense>
    </main>
  );
}
