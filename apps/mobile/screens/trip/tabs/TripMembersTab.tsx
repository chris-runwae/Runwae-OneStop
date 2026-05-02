// Phase 8 cleanup: this file is unreferenced. The active members UI
// lives in apps/mobile/components/trip-activity/MemberCard.tsx,
// rendered by ActivityTab. Kept as an empty default export so the
// directory typechecks; delete the entire screens/trip/ tree when the
// rest of screens/ is removed in Phase 8.
import React from 'react';

export default function TripMembersTab() {
  return null;
}
