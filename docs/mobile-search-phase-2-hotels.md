# Mobile Search — Phase 2 (Hotels)

> **Predecessor:** Phase 1 shipped the Flights flow — see commits on
> `feat/mobile-ui-tweaks` and the original plan at
> `~/.claude/plans/i-just-added-some-temporal-wilkinson.md`. The patterns
> below assume Phase 1 is in `main`.

## Context

Phase 1 made the **Flights** tab in `apps/mobile/app/search.tsx` fully
functional (search → results modal → review → passengers → Stripe → 🎉
confirmation) using the existing `apps/mobile/app/hotel/payment.tsx` Stripe
pattern as a template. Phase 2 does the same for the **Stays** tab using the
LiteAPI provider that's already wired backend-side.

The Stays tab in `search.tsx` is currently the static placeholder UI it
shipped with — it needs to be swapped for a real form, with results opening
in a fullscreen modal stack mirroring the Phase 1 flights flow.

There is also a legacy `apps/mobile/app/hotel/` route stack (`book.tsx`,
`payment.tsx`, `confirmation.tsx`) that handles single-hotel booking after
selection from the **Discover** screen. Phase 2 adds a new entry point —
explicit hotel **search** from `/search` — that funnels into a list view
before reusing the existing per-hotel booking screens. **Don't rip the legacy
hotel/ stack out**: discover and trip pages still link to it.

## Backend status (already wired)

| Function | Path |
|---|---|
| `hotels.search` | `packages/convex/convex/hotels.ts` (action) — args `{ term?, lat?, lng?, checkin?, checkout?, limit? }`, returns `DiscoveryItem[]` |
| `hotels.getRoomRates` | (action) — args `{ hotelId, checkin, checkout, adults }`, returns `LiteApiRate[]` |
| `hotels.startBooking` | (action) — args `{ apiRef, offerId, hotelName, checkin, checkout, eventId? }`, returns `{ bookingId, finalPrice, currency }` |
| `hotels.finalisePaidBooking` | (internal action) — runs after Stripe webhook, calls LiteAPI `book(prebookId)` |
| `payments.createPaymentIntent` | `packages/convex/convex/payments.ts` |
| `bookings.confirmByPaymentIntent` | `packages/convex/convex/bookings.ts` — already wired in Phase 1, dispatches to `finalisePaidBooking` |

So Phase 2 is **mobile UI only** unless we discover gaps mid-implementation.

## Out of scope

- Touch-up of the existing `apps/mobile/app/hotel/` stack — it works. Phase
  2 only adds a list step on top of it.
- Map view / geo-bounded hotel search. The form takes a destination string
  (city / hotel name / address) and passes it as `term`.
- Multi-room booking (`hotels.startBooking` is single-room today).

---

## Files to create

### 1. `apps/mobile/components/search/HotelSearchForm.tsx`
Mirror of `FlightSearchForm.tsx`. Fields:
- **Destination** — tappable row that opens a `DestinationPicker` sheet.
  Free-text input ("Lisbon", "Hotel Avenida", "1600 Pennsylvania Ave"). For
  Phase 2 keep it simple: just a `TextInput` with debounced state. No
  autocomplete query (LiteAPI's destinations endpoint is not currently
  exposed; revisit if UX demands it).
- **Dates** — reuse `<DateModal>` (range, required).
- **Guests & rooms** — reuse the `PassengerStepper.tsx` pattern; fork it as
  `GuestStepper` if 1-room/N-adults is enough, or expand to rooms+adults
  later.
- Sticky **Search** button — enabled when destination + dates set.
- On press: `router.push({ pathname: '/hotels-search/results', params })`.

State holder hook: `apps/mobile/hooks/useHotelSearchState.ts` — copy
`useFlightSearchState.ts` shape.

### 2. `apps/mobile/app/hotels-search/_layout.tsx` + `results.tsx`
**Use a different folder name than the existing `app/hotel/` and
`app/hotels/` routes** to avoid colliding with the legacy stack. The
`hotels-search` group is the new modal stack that funnels into the existing
booking screens. Register in `apps/mobile/app/_layout.tsx` with
`presentation: 'modal'` exactly the way `flights` is registered (lines
214-218 after Phase 1 changes). Add `'hotels-search'` to
`AUTHORIZED_ROOT_ROUTES` and `isInAuthorizedRoot`.

`results.tsx` calls `useAction(api.hotels.search)` once on mount, renders
`SkeletonBox` cards while loading, then a `FlatList` of hotel cards.
Tap a hotel → push `/hotels-search/rooms?hotelId=...&checkin=...&checkout=...`.

### 3. `apps/mobile/app/hotels-search/rooms.tsx`
Calls `useAction(api.hotels.getRoomRates)` for the chosen hotel and dates.
Renders rates with refundability badge and price-per-night. Tap a rate →
**route to the existing** `/hotel/book` screen with all params it expects
(see `apps/mobile/app/hotel/book.tsx:91-133`). The legacy stack handles
prebook → payment → confirmation from there.

### 4. Wire into `search.tsx`
Replace the static Stays section (currently around lines 320-371 of
`search.tsx`, the block guarded by `activeTab === 'stays'`) with
`<HotelSearchForm />` wrapped in the same `Animated.View` fade pattern used
by Flights.

---

## Existing code to reuse

| Need | Path |
|---|---|
| Animated tab indicator | `apps/mobile/components/ui/AnimatedTabBar.tsx` (Phase 1) — already drives the search.tsx tabs |
| Date picker | `apps/mobile/components/trips/edit/DateModal.tsx` |
| Skeleton primitive | `apps/mobile/components/ui/SkeletonBox.tsx` |
| Form-card styling reference | `apps/mobile/components/search/FlightSearchForm.tsx` (Phase 1) |
| Stripe pattern reference | `apps/mobile/app/hotel/payment.tsx` (already implements Stripe Payment Sheet for hotels) |
| Booking confirmation pattern | `apps/mobile/app/hotel/confirmation.tsx` (existing) |

---

## Stripe / LiteAPI flow (already wired end-to-end after Phase 1)

```
Mobile rooms screen → tap rate
  → router.push('/hotel/book', {...})

apps/mobile/app/hotel/book.tsx (existing)
  → api.hotels.startBooking → { bookingId, finalPrice, currency }
  → api.payments.createPaymentIntent({ amount, currency, metadata: { kind: 'hotel_booking', bookingId } })
  → router.push('/hotel/payment', { clientSecret, ... })

apps/mobile/app/hotel/payment.tsx (existing)
  → initPaymentSheet → presentPaymentSheet
  → on success → router.replace('/hotel/confirmation', { ... })

Stripe webhook (Convex http endpoint)
  → bookings.confirmByPaymentIntent (Phase 1)
  → schedules internal.hotels.finalisePaidBooking
  → hotels.finalisePaidBooking → providers.liteapi.book(prebookId)
```

Phase 1's `confirmByPaymentIntent` is what makes the existing hotel mobile
flow actually finalize bookings. Before Phase 1 it was silently broken — the
PaymentSheet would charge, but the webhook only handled
`checkout.session.completed`, so the booking never moved off
`pending_payment`. **Verify** this still works on Phase 2 startup by paying
once with a Stripe test card and confirming the row flips to `confirmed`
within a few seconds.

---

## Verification plan

1. `pnpm --filter @runwae/convex dev` (Terminal 1).
2. `cd apps/mobile && pnpm start` (Terminal 2). iOS simulator.
3. From home, tap **Stays** card → `/search?tab=stays` opens with the
   Stays indicator active.
4. Type "Lisbon", pick checkin/checkout 2 days apart, leave guests at 2.
5. Tap **Search** → modal slides up, skeletons → real LiteAPI results.
6. Tap a hotel → rooms screen lists rates.
7. Tap a refundable rate → existing `/hotel/book` flow takes over.
8. Stripe test card `4242 4242 4242 4242` → `/hotel/confirmation` (existing)
   shows confirmation. Verify the booking row in Convex flips to `confirmed`
   and a row appears in `commissions`.
9. **Failure paths to verify:**
   - LiteAPI returns 0 rates → rooms screen renders an empty state.
   - LiteAPI prebook fails → `startBooking` throws; caller already toasts.
   - Stripe declined card → user stays on payment screen; booking stays
     `pending_payment`.
10. Type-check both workspaces — same commands as Phase 1.

---

## Suggested execution order

2A. Build `HotelSearchForm` + `useHotelSearchState`. Wire into `search.tsx`.
    Search button just routes to a stub `/hotels-search/results` that prints
    params.
2B. Wire `api.hotels.search` in `results.tsx` with skeletons + cards.
2C. Build `rooms.tsx`. Tap-rate handoff to existing `/hotel/book` route
    with the right params.
2D. End-to-end test on Stripe test cards. Document any backend gaps and
    fix in a follow-up.
