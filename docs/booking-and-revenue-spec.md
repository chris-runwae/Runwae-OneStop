# Booking + Revenue Spec

## Context

The current booking pipeline charges users via Runwae's Stripe account, then
calls LiteAPI / Duffel to actually reserve the room or flight. Two problems
surfaced in research:

1. **Hotels (LiteAPI):** the integration uses `method: "ACC_CREDIT_CARD"`,
   which means LiteAPI would charge a card on file in Runwae's LiteAPI
   account at book time. No such card exists yet (sandbox keys masked
   this). Worse, LiteAPI is being asked for net rates (no `margin`), so
   the user is being charged exactly what LiteAPI would invoice Runwae —
   net revenue is currently negative once Stripe fees are deducted.

2. **Flights (Duffel):** the integration uses `card` payments where
   Duffel is a payment relay between the user and the airline. Card
   payments don't allow Runwae to add a markup — the user pays the exact
   amount Duffel quotes. The current 3% commission stored on each row is
   bookkeeping fiction. The flow does work in sandbox, but the only way
   to earn margin is to switch to **Duffel Balance** (a pre-funded
   wallet) which lets Runwae charge the user one amount and pay Duffel a
   lower amount from the balance.

Both changes also need to plug into the **revenue split with event
hosts** the user wants to support: when a booking is tied to an event,
the host gets a percentage of Runwae's margin.

This spec covers all of it — the LiteAPI migration, the Duffel switch,
the host revenue split, a "My bookings" surface for users, and refunds.
It does **not** rebuild Stripe Connect — manual payouts are good enough
for MVP.

---

## High-level money flow (target state)

```
User books a hotel ($275 total = $250 net + $25 margin)
  ↓
LiteAPI Payment SDK collects card details on device
  ↓
LiteAPI charges user's card $275 (LiteAPI is Merchant of Record)
  ↓
LiteAPI keeps $250 to pay the hotel
  ↓
LiteAPI owes Runwae $25 — paid out weekly after guest checkout
  ↓
Once paid out, Runwae owes the host their split (e.g. $12.50)
  ↓
Admin triggers payout (manual transfer for MVP)
```

```
User books a flight ($412 total = $400 airfare + $12 margin)
  ↓
Stripe Payment Sheet collects card details (Runwae is Merchant of Record)
  ↓
Stripe deposits $412 minus Stripe fees into Runwae's account
  ↓
Convex action calls Duffel order/create with payment.type = "balance"
  ↓
Duffel deducts $400 from Runwae's pre-funded Duffel Balance
  ↓
Duffel pays the airline $400
  ↓
Runwae keeps the $12 margin (minus Stripe fees)
  ↓
Same host-split logic if the booking carries an eventId
```

Two different MoR models because the SDKs differ — LiteAPI offers a
mobile SDK that abstracts Stripe; Duffel only offers a JS SDK that's
awkward to embed in React Native, so flights stay on Runwae's existing
Stripe Payment Sheet + Duffel Balance settles with the airline.

---

## Track 1 — LiteAPI Payment SDK migration

### Decision summary

Switch from `ACC_CREDIT_CARD` to LiteAPI's native React Native payment
wrapper (`liteapi-react-native-payment-wrapper`, v1.0.6). Rationale:

- No need to maintain a credit card with LiteAPI.
- Margin actually earns money — LiteAPI pays Runwae the difference weekly
  after guest checkout.
- The wrapper uses `@stripe/stripe-react-native` under the hood (already
  installed), so the native deps don't change.

### Backend changes (Convex)

**[providers/liteapi.ts](packages/convex/convex/providers/liteapi.ts)**

- `prebook`: change `usePaymentSdk: false` → `true`. Surface the
  `secretKey` and `transactionId` from the response (currently dropped).
- `getRoomRates` + `fetchRates`: add a `margin` parameter to the request
  body (default `10` — make it configurable per-event later). LiteAPI
  returns retail rates that include the markup; that's what the user
  sees, that's what they get charged.
- `book`: change `method` from `"ACC_CREDIT_CARD"` to `"TRANSACTION"` and
  pass the `transactionId` from the SDK callback (not the Stripe PI ID).

**[hotels.ts](packages/convex/convex/hotels.ts)**

- `startBooking`: stop minting our own Stripe PaymentIntent. Instead
  return the LiteAPI `transactionId` + `secretKey` to the client so the
  SDK can render the payment sheet.
- New `finalisePaidBooking` shape: trigger it from a client callback
  (`handlePaymentSuccess`), not from the Stripe webhook — LiteAPI's
  payment doesn't fire our webhook.

**[bookings.ts](packages/convex/convex/bookings.ts)**

- `finaliseHotelBooking`: stop direct-inserting commissions. Call
  `internal.commissions.recordForBooking` instead, passing
  `hostSharePct` derived from the linked event (or 0 if no event).
  The function I refactored earlier today is ready for this.

### Mobile changes

**[app/hotel/payment.tsx](apps/mobile/app/hotel/payment.tsx)**

- Replace the `useStripeSafe` + `initPaymentSheet` flow with
  `<LiteAPIPayment liveMode={env === 'prod'}><PayButton apiKey publicKey offerId/></LiteAPIPayment>`
  from the wrapper.
- The success callback now hands us a `transactionId`; pass it to
  `hotels.finaliseBooking` (new action) which calls LiteAPI `book` with
  `method: TRANSACTION`.
- Keep the inline `PaymentErrorBanner` for retryable errors.

**New env var** (per environment, set via EAS):
`EXPO_PUBLIC_LITEAPI_PUBLIC_KEY` — LiteAPI's public key for the SDK.

### Risk

The wrapper hasn't been updated since Aug 2024. Spin up a smoke build
before committing to the switch — if it doesn't compile against current
RN, we either patch-package a minimal fix or open an issue upstream.

---

## Track 2 — Duffel Balance migration (flights)

### Decision summary

Keep Runwae's Stripe Payment Sheet for user-facing card collection,
switch the Duffel `order/create` call from `payment.type = "card"` (no
markup possible) to `payment.type = "balance"` (markup possible, drawn
from a pre-funded wallet).

### Backend changes (Convex)

**[providers/duffel.ts](packages/convex/convex/providers/duffel.ts)**

- `createOrder`: change `payment.type` to `"balance"`. Pass the airline
  amount (offer total) as `payment.amount`. **No more passing the full
  user-paid amount including markup** — that becomes Runwae's margin in
  the gap between user payment and Duffel charge.

**[flights.ts](packages/convex/convex/flights.ts)**

- `search` / `getOffer`: add a `markupPct` (default `3` — match the
  current hardcoded commission). The offer total surfaced to the user
  becomes `offer.totalAmount * (1 + markupPct/100)`.
- `startBooking`: mint a Stripe PaymentIntent for the marked-up amount
  (not the raw offer amount). The 3% is now real margin, not a
  bookkeeping fiction.
- `finalisePaidBooking`: after the Stripe webhook confirms, call
  `duffel.createOrder` with `payment.type = "balance"` and
  `payment.amount = offer.totalAmount` (airline amount, not user
  amount). The difference is Runwae's earned margin.
- Same `commissions.recordForBooking` call as hotels — with
  `hostSharePct` derived from the linked event.

### Operational prerequisite

**Top up Duffel Balance.** Per [Duffel's docs](https://duffel.com/docs/guides/balance),
you transfer funds in via bank transfer or Stripe. If the balance hits
zero, `order/create` fails — which causes the existing refund-on-failure
path ([bookings.ts:538-547](packages/convex/convex/bookings.ts:538)) to
auto-refund the user's Stripe payment. Safe failure mode, but bad UX —
set up a balance threshold alert in the Duffel dashboard.

### Risk

Stripe is the merchant of record on flights, so chargebacks land on
Runwae. That's the trade-off for being able to mark up the price.

---

## Track 3 — Host revenue split

### Data model

Already supported by the existing `commissions` table. The fix from
earlier today renamed the arg to `hostSharePct`. New work:

**[schema.ts](packages/convex/convex/schema.ts)**

- Add `events.hostSharePct: v.optional(v.number())` — defaults to 50 if
  unset. Admin-only writeable.

**[admin/events.ts](packages/convex/convex/admin/events.ts)**

- New `setEventHostShare` mutation: takes `eventId` + `hostSharePct`,
  validates `[0, 100]`, persists. Admin-guarded via `requireAdmin`.

### Wiring the split

Two flows where a booking might be tied to an event:

1. **User creates a trip from an event** — every booking made within
   that trip carries the trip's `eventId`. The trip-creation code path
   already supports this (the `events` page passes `eventId` when
   creating a trip).
2. **User books from the event-detail page** — addon hotels, flights,
   experiences rendered on the event detail page pass `eventId` through
   to the booking action.

For both, the booking row's `eventId` is already populated. The change
is in commission-row insertion:

```ts
// in finaliseHotelBooking + finaliseFlightBooking (today: direct insert)
const event = booking.eventId
  ? await ctx.db.get(booking.eventId)
  : null;
const host = event?.hostId ? await ctx.db.get(event.hostId) : null;
const hostSharePct = event?.hostSharePct ?? (host ? 50 : 0);

await ctx.runMutation(internal.commissions.recordForBooking, {
  bookingId: booking._id,
  eventId: booking.eventId,
  hostId: host?._id,
  totalCommission: booking.commissionAmount,
  hostSharePct,
  currency: booking.currency,
});
```

### Status transitions

Today: `pending` → (nothing). Going forward:

- `pending` — booking confirmed, commission recorded. Host hasn't earned
  yet (guest may cancel).
- `held` — guest has checked out (hotels) or flown (flights). The
  earnings are locked in but cash hasn't landed at Runwae yet.
- `paid` — LiteAPI/Duffel has settled with Runwae (weekly). Host is now
  owed their share.

A daily cron flips `pending → held` when `booking.checkout < today`
(hotels) or `lastSegment.departureAt < today` (flights). The
`pending → paid` transition is manual: admin reviews the LiteAPI/Duffel
settlement CSV, marks rows.

### Host dashboard

Already partially exists ([commissions.ts:33-64 getHostEarnings](packages/convex/convex/commissions.ts:33)).
Sums hostShare by status. New UI:

- `apps/mobile/app/host/earnings.tsx` (or web equivalent for hosts who
  log in to the dashboard) — shows pending / held / paid totals + a list
  of contributing bookings.

### Admin payout flow (manual, MVP)

- `apps/web` admin console (or a `/admin` route in mobile if no web
  console) lists hosts with `paid`-status commissions that haven't been
  payout-marked. Admin clicks "Mark paid" after sending the bank
  transfer; that flips status from `paid` to `paid_out` (new state) and
  inserts a `payouts` row.
- Bonus: 4-week-post-event reminder cron that pings admin if any `paid`
  commissions are >28 days old without a payout.

---

## Track 4 — "My bookings" surface

Today: there's no way for a user to see their bookings after they leave
the confirmation screen. This needs to land before App Store submit
because review will look for it.

### Where it lives

Profile tab, new sub-section "My bookings" (above Security in the menu).
Route: `apps/mobile/app/(tabs)/profile/bookings/index.tsx` — list of all
bookings sorted by date desc.

### Detail screen

`apps/mobile/app/(tabs)/profile/bookings/[bookingId].tsx` — shows:

- Booking type icon + title (hotel name, route summary)
- Status badge (`pending`, `confirmed`, `cancelled`, `completed`)
- Dates / times / passengers
- Total paid + currency
- Confirmation code (from `rawResponse.liteapiConfirmationCode` or
  `rawResponse.duffelBookingReference`)
- **Action buttons**, conditional on status + cancellation policy:
  - "Cancel booking" (hotel: only if `cancellationPolicies.refundableTag === "RFN"` and within window; flight: only if Duffel cancellation rules allow)
  - "View original confirmation email"
  - "Contact support"

### Backend

Two new queries:

- `bookings.listMine` — returns all bookings for the auth user, sorted
  desc.
- `bookings.getMine(bookingId)` — single booking; throws if not owned by
  caller.

---

## Track 5 — Refunds

### Today

We already have an auto-refund path ([bookings.ts:538-547](packages/convex/convex/bookings.ts:538))
that fires when LiteAPI/Duffel reject a booking after Stripe captured
the payment. It calls `internal.payments.refundStripePayment`.

### Missing: user-initiated cancellation

User taps "Cancel booking" → backend checks provider's cancellation
policy → calls LiteAPI/Duffel cancel → on success, refunds via Stripe.

**[bookings.ts](packages/convex/convex/bookings.ts) — new mutation:**

```ts
export const cancelMyBooking = action({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const booking = await ctx.runQuery(...);
    if (booking.userId !== userId) throw ...;
    if (booking.status !== "confirmed") throw ...;

    if (booking.type === "hotel") {
      // LiteAPI cancel endpoint
      const res = await ctx.runAction(internal.providers.liteapi.cancel, {
        liteapiBookingId: booking.rawResponse.liteapiBookingId,
      });
      if (!res.ok) throw new Error(res.reason);
    } else if (booking.type === "flight") {
      // Duffel order action: cancel
      const res = await ctx.runAction(internal.providers.duffel.cancelOrder, {
        orderId: booking.rawResponse.duffelOrderId,
      });
      if (!res.ok) throw new Error(res.reason);
    }

    await ctx.runMutation(internal.bookings.markCancelled, { bookingId });
    // Schedule the refund off the hot path — Stripe takes 5-10 days to
    // process even after we initiate, so the user just sees "Cancellation
    // confirmed, refund issued".
    if (booking.stripePaymentIntentId) {
      await ctx.scheduler.runAfter(0, internal.payments.refundStripePayment, {
        paymentIntentId: booking.stripePaymentIntentId,
        reason: "user_requested",
      });
    }

    // Reverse the commission row.
    await ctx.runMutation(internal.commissions.reverseForBooking, {
      bookingId,
    });
  },
});
```

A new `commissions.reverseForBooking` flips the row to a `reversed`
status so it's excluded from host earnings.

---

## Implementation order

Suggest landing these in order, each as a separate PR:

1. **App Store blockers complete** — already true per the audit doc.
2. **Search fix** — already shipped this session.
3. **Schema additions** — `events.hostSharePct`, `commissions` status
   widened to include `held`, `paid_out`, `reversed`. Small migration.
4. **Track 3 — host split wiring** — change the direct-inserts to use
   `recordForBooking`, add the admin UI to set per-event splits.
   Backwards-compatible (no behaviour change for users yet).
5. **Track 4 — My bookings UI** — read-only surface. Lands before App
   Store submission.
6. **Track 5 — User-initiated cancellation + refund** — depends on (4).
7. **Track 2 — Duffel Balance migration** — needs the user to top up
   the balance first, then code change. Independent of LiteAPI.
8. **Track 1 — LiteAPI Payment SDK migration** — the biggest UI change.
   Could ship alongside (2) or after, but doesn't depend on it.
9. **Host dashboard** — UI on top of `getHostEarnings`. Independent.
10. **Admin payout panel** — manual mark-paid flow. Independent.

Tracks 7/8 are the "real revenue" changes. (4) is the App Store unlock.
(3) is foundation work.

---

## Things not in scope

- **Stripe Connect onboarding for hosts.** Manual bank transfers for
  MVP per direction. Wire Connect later when payout volume justifies it.
- **Tiqets / Eventbrite for international events search.** Separately
  tracked in the App Store audit doc — sign up for Tiqets API key,
  add `TIQETS_KEY` to Convex env. ~10 min, no code.
- **Refund partial amounts.** Right now refunds are 100% of the
  PaymentIntent. Most cancellation policies are either full or none, so
  partials are deferrable.
- **Multi-currency host payouts.** Hosts are paid in the same currency
  as the booking. If a host gets bookings in mixed currencies, MVP
  treats them as separate payout streams.

---

## Critical files

| File | Track | Touched |
|------|-------|---------|
| `packages/convex/convex/providers/liteapi.ts` | 1 | `usePaymentSdk`, return SDK fields, `margin` param, `book` method change |
| `packages/convex/convex/hotels.ts` | 1, 3 | New `finaliseBooking` action; recordForBooking |
| `packages/convex/convex/providers/duffel.ts` | 2 | `createOrder` → `payment.type = balance` |
| `packages/convex/convex/flights.ts` | 2, 3 | `markupPct`, recordForBooking |
| `packages/convex/convex/bookings.ts` | 3, 5 | recordForBooking wiring, `cancelMyBooking`, status transitions |
| `packages/convex/convex/commissions.ts` | 3, 5 | `reverseForBooking`, status widening |
| `packages/convex/convex/schema.ts` | 3 | `events.hostSharePct`, status union |
| `packages/convex/convex/admin/events.ts` | 3 | `setEventHostShare` |
| `apps/mobile/app/hotel/payment.tsx` | 1 | Swap to LiteAPIPayment + PayButton |
| `apps/mobile/app/flights/book/payment.tsx` | 2 | No change — still Stripe Sheet |
| `apps/mobile/app/(tabs)/profile/bookings/index.tsx` | 4 | New |
| `apps/mobile/app/(tabs)/profile/bookings/[bookingId].tsx` | 4, 5 | New |
| `apps/mobile/components/booking/*` | 4, 5 | Cancel button, status badge |
| `apps/mobile/app/host/earnings.tsx` | 3 | New |

---

## Verification

- **LiteAPI payment SDK in dev build** — book a sandbox hotel, payment
  sheet appears, success returns transactionId, booking confirms.
- **Duffel Balance in sandbox** — top up sandbox balance, book a flight,
  `payment.type = balance` in the Duffel order request body, balance
  decremented, order confirmed.
- **Host split** — admin creates event with `hostSharePct = 50`, user
  books a hotel within a trip tied to that event, commissions row has
  `hostShare = totalCommission/2`, host dashboard shows pending earnings.
- **My bookings** — book a hotel, navigate to Profile → My bookings,
  see the row.
- **Cancellation** — user taps Cancel on a refundable hotel, LiteAPI
  reservation cancelled, Stripe refund initiated, commissions row
  flipped to `reversed`.
