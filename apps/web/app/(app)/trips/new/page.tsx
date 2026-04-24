import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Trip" };

export default function NewTripPage() {
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">New Trip</h1>
    </main>
  );
}
