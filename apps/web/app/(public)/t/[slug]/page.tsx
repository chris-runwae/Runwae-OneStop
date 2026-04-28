import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shared Trip" };

export default async function PublicTripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-foreground">Trip: {slug}</h1>
    </main>
  );
}
