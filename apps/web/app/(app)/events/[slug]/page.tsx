import type { Metadata } from "next";

export const metadata: Metadata = { title: "Event" };

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">{slug}</h1>
    </main>
  );
}
