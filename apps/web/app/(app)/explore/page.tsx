import type { Metadata } from "next";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Explore</h1>
    </main>
  );
}
