"use client";
import type { Doc } from "@/convex/_generated/dataModel";
export function ExpensesView(_: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  return (
    <div className="rounded-2xl border border-dashed border-foreground/15 px-6 py-10 text-center text-sm text-foreground/60">
      Expenses are coming soon. We&apos;ll surface group splits and your share here.
    </div>
  );
}
