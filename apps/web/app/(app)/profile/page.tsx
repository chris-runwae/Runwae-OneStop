import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>
    </main>
  );
}
