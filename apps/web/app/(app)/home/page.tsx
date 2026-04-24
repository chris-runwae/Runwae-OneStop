import type { Metadata } from "next";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Home</h1>
    </main>
  );
}
