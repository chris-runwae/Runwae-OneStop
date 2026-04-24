import type { Metadata } from "next";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Events</h1>
    </main>
  );
}
