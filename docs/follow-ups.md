# Follow-ups

Things deferred from in-flight work that need a separate slice.

## From section 4 (Itinerary Templates)

- [ ] Surface `itinerary_items.externalUrl` on the consumer trip detail
      page (`apps/web` `/trips/[slug]` day view) and the mobile equivalent
      (`mobile/`). Today the field is captured by the admin and copied
      through `createFromTemplate`, but no consumer UI renders it yet, so
      the booking link is invisible to end users.
- [ ] Consider affiliate-link rewriting on `externalUrl` (Booking.com,
      Viator, etc.) so admin-curated bookings generate commission.
      Probably belongs in a Convex action that runs at materialisation
      time and stores the rewritten URL alongside the original.
- [ ] Widen itinerary_items.type to include food/lodging/free (or 
      widen the template item type to match itinerary_items). Currently 
      template "food/lodging/free" items collapse to "activity" during 
      template clone via normalizeItemType in trips.ts:618.