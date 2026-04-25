import type { Metadata } from "next";
import { CreateTripWizard } from "@/components/trips/CreateTripWizard";

export const metadata: Metadata = { title: "New trip" };

export default function NewTripPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Create a trip</h1>
      <p className="mb-6 text-sm text-muted-foreground">A few quick steps and you&apos;re planning.</p>
      <CreateTripWizard />
    </main>
  );
}
