import type { Metadata } from "next";

export const metadata: Metadata = { title: "Event" };

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-foreground">Event: {slug}</h1>
    </main>
  );
}
