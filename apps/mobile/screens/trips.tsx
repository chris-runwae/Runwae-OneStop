// Phase 8 cleanup: this file is unreferenced. The active Trips index
// page lives at apps/mobile/screens/trips/TripsIndexScreen.tsx, which is
// what `app/(tabs)/(trips)/trip.tsx` imports. Kept as an empty default
// export so the directory typechecks; delete in Phase 8.
import React from 'react';

export default function TripsLegacy() {
  return null;
}
