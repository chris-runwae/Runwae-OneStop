import type { Doc } from "../_generated/dataModel";

// Public event shape — same as the stored Doc minus admin-only fields. Used
// at every public exit point so adminNotes never reaches a non-admin caller.
// isTrending and trendingRank are intentionally kept: they're curation
// outputs that the consumer surfaces (trending badge, ranked rails).
export type PublicEvent = Omit<Doc<"events">, "adminNotes">;

export function toPublicEvent(event: Doc<"events">): PublicEvent {
  const { adminNotes: _adminNotes, ...rest } = event;
  return rest;
}

// Variant for callers that may pass null (e.g. ctx.db.get results before a
// presence check). Split from toPublicEvent because TypeScript's overload
// resolution picks the wider signature when used with .map(), polluting
// downstream array element types with null.
export function toPublicEventOrNull(
  event: Doc<"events"> | null
): PublicEvent | null {
  return event === null ? null : toPublicEvent(event);
}
