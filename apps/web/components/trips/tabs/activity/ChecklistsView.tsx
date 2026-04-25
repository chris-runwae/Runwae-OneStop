"use client";
import type { Doc } from "@/convex/_generated/dataModel";
export function ChecklistsView(_: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  return (
    <div className="rounded-2xl border border-dashed border-foreground/15 px-6 py-10 text-center text-sm text-foreground/60">
      Pre-trip checklists are coming soon.
    </div>
  );
}
