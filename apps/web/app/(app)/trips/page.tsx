import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Trips" };

export default function TripsPage() {
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">My Trips</h1>
    </main>
  );
}
