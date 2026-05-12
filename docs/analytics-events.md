# Runwae Analytics Event Registry

This is the contract. Every analytics event Runwae captures lives here. **Event names are forever** — once an event ships, its name and property keys cannot change without a parallel migration plan. If you want to add an event, extend the `AnalyticsEvent` union in [`apps/mobile/lib/analytics.ts`](../apps/mobile/lib/analytics.ts) (or the server-side equivalent in Commit 3) first, then add it to this doc in the same PR.

**Provider:** PostHog. EU cloud (`https://eu.i.posthog.com`) is the default; override via `EXPO_PUBLIC_POSTHOG_HOST` if needed.

**No PII**, ever. Email, name, phone, raw entity ids — none of these are allowed in event properties. User properties are joined separately via `identify(userId)` where `userId` is the Convex `users._id`.

**Server-side wins** for high-value events (`signup_*`, `signin_succeeded`, `first_*`, `onboarding_*`, `booking_completed`, `booking_failed`). Mobile capture can be lossy on bad networks; Convex actions cannot.

---

## Implementation status

The 11-event contract from [`docs/phase-2.5-and-4-handover.md`](phase-2.5-and-4-handover.md). All 11 events are wired and shipping. Verification (Commit 4 — saved funnel insight) still pending.

| Event | Side | Status |
|---|---|---|
| `signin_failed` | client | ✅ live |
| `trip_viewed` | client | ✅ live |
| `itinerary_item_added` | client | ✅ live |
| `booking_started` | client | ✅ live (hotel only) |
| `signup_completed` | server | ✅ live |
| `signin_succeeded` | server | ✅ live |
| `first_trip_created` | server | ✅ live |
| `first_invite_accepted` | server | ✅ live |
| `onboarding_completed` | server | ✅ live |
| `booking_completed` | server | ✅ live |
| `booking_failed` | server | ✅ live |

---

## Event reference

### `signin_failed`

- **Trigger:** Any auth failure — bad credentials, server error, network error, user cancellation, OAuth provider error.
- **Where it fires:** [`apps/mobile/hooks/useAuth.ts`](../apps/mobile/hooks/useAuth.ts) catch blocks in `signIn`, `signUp`, `signInWithGoogle` (3 sites: cancel, non-success, thrown), `signInWithApple`, `resetPassword`, `confirmPasswordReset`, `verifyEmail`.
- **Properties:**
  - `provider: "apple" | "google" | "password"` — string, exactly one of three literals.
  - `error_code: string` — stable token from `extractAuthErrorCode()`. See [Auth error codes](#auth-error-codes) below for the value set.
- **Why:** Sign-up + sign-in failure rates surface auth provider regressions early. Cancellations (`error_code: "cancelled"`) are deliberately included to measure friction in OAuth flows.
- **Retention:** PostHog default (12 months).

### `trip_viewed`

- **Trigger:** A trip detail screen mounts and `activeTrip` is loaded. Fires once per `activeTrip._id` change — revisiting the same trip in the same nav stack doesn't refire; opening a different trip does.
- **Where it fires:** [`apps/mobile/screens/trip/TripDetailScreen.tsx`](../apps/mobile/screens/trip/TripDetailScreen.tsx) `useEffect` keyed on `activeTrip._id`.
- **Properties:**
  - `trip_id_hash: string` — sha256 hex digest of the raw `trips._id`. Never the raw id.
- **Why:** Engagement signal; cohorts the funnel from sign-up → trip creation → trip view → itinerary build.
- **Retention:** PostHog default (12 months).

### `itinerary_item_added`

- **Trigger:** A user submits the Add Item sheet on the itinerary tab. Fires optimistically — before the upload + Convex mutation — so we measure intent. Mutation failures are a separate Sentry signal.
- **Where it fires:** [`apps/mobile/screens/trip/tabs/TripItineraryTab.tsx`](../apps/mobile/screens/trip/tabs/TripItineraryTab.tsx) top of `handleAddItem`.
- **Properties:**
  - `item_type: "flight" | "hotel" | "event" | "experience"` — analytics bucket, NOT the raw schema type. See [Item-type bucketing](#item-type-bucketing) below.
- **Why:** Tells us what kind of plans users build — drives roadmap weighting between flight/hotel/experience tooling.
- **Retention:** PostHog default (12 months).

### `booking_started`

- **Trigger:** User taps "Book" on a hotel room. Fires before the navigation to the payment screen.
- **Where it fires:** [`apps/mobile/screens/hotels/RoomDetailsScreen.tsx`](../apps/mobile/screens/hotels/RoomDetailsScreen.tsx) top of `handleBook`.
- **Properties:**
  - `type: "hotel" | "experience" | "flight"` — currently always `"hotel"`. See [Pending coverage](#pending-coverage).
  - `amount_gbp: number` — the displayed price. See [GBP normalisation](#gbp-normalisation) note.
- **Why:** Top-of-funnel conversion intent. Pairs with server-side `booking_completed` to compute hotel-room funnel conversion.
- **NOT fired from:** [`apps/mobile/app/hotel/book.tsx`](../apps/mobile/app/hotel/book.tsx) `handleConfirm`. The server-side `booking_completed` event is the truthful conversion measurement; double-firing on confirm would skew the funnel.
- **Retention:** PostHog default (12 months).

### `signup_completed` · `signin_succeeded` (server)

- **Trigger:** Fired from inside Convex `createOrUpdateUser` auth callback. `signup_completed` when `args.existingUserId` is null (new row inserted), `signin_succeeded` when it is set. The OTP-verification step (`args.type === "verification"`) is skipped so password sign-ups don't double-fire.
- **Where it fires:** [`packages/convex/convex/auth.ts`](../packages/convex/convex/auth.ts) `createOrUpdateUser` callback. The actual HTTP capture is scheduled via [`packages/convex/convex/lib/posthog.ts`](../packages/convex/convex/lib/posthog.ts) `scheduleServerTrack` → `serverTrack` internal action.
- **Properties:**
  - `provider: "apple" | "google" | "password"` — derived from `args.provider.id` via `mapProviderIdToAnalytics`. `apple-native` (custom ConvexCredentials) maps to `"apple"`; the OIDC `"apple"` provider also maps to `"apple"`.
- **Caveat:** `signup_completed` fires when the users row is inserted, which for password flows is BEFORE the OTP verification step. A user who abandons OTP still produces a `signup_completed` event. Live with it for v1; revisit if the funnel-drop-off becomes interesting.

### `first_trip_created` (server)

- **Trigger:** Fires the first time a user calls `trips.createTrip`. Detection: query `trips` by `creatorId` BEFORE the insert; if null, this is the first.
- **Where it fires:** [`packages/convex/convex/trips.ts`](../packages/convex/convex/trips.ts) `createTrip`, after the trip insert.
- **Properties:** none.

### `first_invite_accepted` (server)

- **Trigger:** Fires the first time a user accepts a non-owner trip membership via `trips.respondToInvite`. Detection: query `trip_members` for any prior `status === "accepted" AND role !== "owner"` row for this user.
- **Where it fires:** [`packages/convex/convex/trips.ts`](../packages/convex/convex/trips.ts) `respondToInvite`, inside the `accept` branch.
- **Properties:** none.
- **NOT fired from:** `joinByCode` — that's a code-share path, not an invite. Different funnel. The handover named `acceptInvite` explicitly.

### `onboarding_completed` (server)

- **Trigger:** Fires when `users.completeOnboarding` flips `onboardingComplete: false → true`. Re-calling the mutation when already complete is a no-op (gated by reading the current value).
- **Where it fires:** [`packages/convex/convex/users.ts`](../packages/convex/convex/users.ts) `completeOnboarding`.
- **Properties:** none.

### `booking_completed` (server)

- **Trigger:** Fires when `confirmBookingPostPayment` is called after Stripe confirms payment — both the Checkout Session path (`confirmByStripeSession`) and the PaymentIntent path (`confirmByPaymentIntent`). Idempotent: the early-return on `booking.status === "confirmed"` happens BEFORE the track call, so retries don't refire.
- **Where it fires:** [`packages/convex/convex/bookings.ts`](../packages/convex/convex/bookings.ts) inside `confirmBookingPostPayment`.
- **Properties:**
  - `type: "hotel" | "experience" | "flight"` — `mapBookingTypeToAnalytics(booking.type)`. The schema's `tour / car_rental / event_ticket` all flatten to `"experience"`.
  - `amount_gbp: number` — `booking.grossAmount`. See [GBP normalisation](#gbp-normalisation).
- **Caveat:** For hotel/flight, this fires at Stripe success, BEFORE supplier-side confirmation (LiteAPI book / Duffel order). Supplier-side failures show up in Sentry, not as a separate analytics event.

### `booking_failed` (server)

- **Trigger:** Fires when `bookings.failByPaymentIntent` is called from the Stripe `payment_intent.payment_failed` webhook. Idempotent: skipped if booking is already cancelled.
- **Where it fires:** [`packages/convex/convex/bookings.ts`](../packages/convex/convex/bookings.ts) inside `failByPaymentIntent`.
- **Properties:**
  - `type: "hotel" | "experience" | "flight"` — same mapping as `booking_completed`.
  - `failure_reason: string` — currently always `"stripe_payment_failed"`. Stripe's decline_code / failure_code isn't yet plumbed through the webhook → mutation hop. Enrich later.

---

## Pending coverage

- **`booking_started` for experiences** — the mobile experience flow currently `Linking.openURL`s out to Viator and does not run through an in-app payment step. Once an in-app experience booking flow lands, instrument it with `type: "experience"`.
- **`booking_started` for flights** — no in-app flight booking flow exists yet.

When these flows ship, the analytics wiring is local to the new screens; no contract change required.

---

## Property hygiene rules

| Rule | Why |
|---|---|
| No `email`, `name`, `phone`, raw `_id`, or anything that could re-identify a user from the event payload alone. | PostHog identify-events are the only legitimate join key. |
| Raw entity ids must be hashed with sha256 before being put in a property. Use `hashTripId()` from `lib/analytics-helpers.ts` for trip ids. Add similar helpers for any new entity. | Defence in depth — even if event data leaks, raw ids stay protected. |
| Monetary properties end in `_gbp` and are stored as a number in major units (GBP, e.g. `129.50`). Currency conversion at capture-time is the caller's job. | Cross-region analytics need one currency; GBP is Runwae's default per `users.currency`. |
| Adding a new event MUST first extend `AnalyticsEvent` in `lib/analytics.ts`. The TypeScript wall is what prevents drift. | "Event names are forever" — typos = permanent commitments. |
| Adding a new property MUST extend the same union, and old events keep their old property shape forever. New properties are additive only. | PostHog cannot retroactively rename properties. |

---

## Item-type bucketing

The Convex schema's `itinerary_items.type` union has 7 values; the analytics contract has 4. [`mapItineraryItemTypeToAnalyticsBucket()`](../apps/mobile/lib/analytics-helpers.ts) flattens them:

| Schema `type` | Analytics `item_type` |
|---|---|
| `flight` | `flight` |
| `hotel` | `hotel` |
| `event` | `event` |
| `tour` | `experience` |
| `activity` | `experience` |
| `restaurant` | `experience` |
| `transport` | `experience` |
| _any future addition_ | `experience` (default) |

The fallthrough default to `experience` is intentional: silently dropping events is worse than a slightly noisy `experience` bucket. If a new schema type needs its own analytics bucket, extend both the union and the switch in one PR.

---

## Auth error codes

`extractAuthErrorCode()` in [`apps/mobile/lib/analytics-helpers.ts`](../apps/mobile/lib/analytics-helpers.ts) returns one of:

| Code | Meaning |
|---|---|
| `cancelled` | User dismissed the Apple sheet, Google browser, or any flow surfaced `ERR_REQUEST_CANCELED` / a "cancel"-shaped message. |
| `InvalidAccountId` | Convex Auth: no such email, or wrong-email/wrong-password ambiguity. |
| `InvalidSecret` | Convex Auth: wrong password. |
| `AccountAlreadyExists` | Sign-up against an existing email. |
| `TooManyRequests` | Rate-limited. |
| `NetworkError` | Fetch failure / offline. |
| `Timeout` | Auth call exceeded `withAuthTimeout`. |
| `ERR_*` (any SDK code) | A native SDK code we don't recognise — passes through unchanged. |
| `unknown` | Fell off the end. Any frequency here is a signal to add a new pattern. |

---

## GBP normalisation

`amount_gbp` on `booking_started` is currently sourced from the displayed `price.amount` in `RoomDetailsScreen`. Today the hotel price is always served in GBP, so this is a true GBP value. When multi-currency display lands (per `users.currency`), the booking-started handler needs to convert back to GBP before firing — analytics should always be in one currency for funnel maths.

---

## How to test locally

1. Set `EXPO_PUBLIC_POSTHOG_KEY` in `apps/mobile/.env` (preview env already has it).
2. Open PostHog → Live Events (US or EU cloud, whichever your project is on).
3. In the app:
   - Sign in with a deliberately wrong password → expect `signin_failed { provider: "password", error_code: "InvalidSecret" }`.
   - Open any trip → expect `trip_viewed { trip_id_hash: <64 hex chars> }`.
   - Add a flight to the itinerary → expect `itinerary_item_added { item_type: "flight" }`.
   - Add a restaurant → expect `itinerary_item_added { item_type: "experience" }`.
   - Tap "Book" on a hotel room → expect `booking_started { type: "hotel", amount_gbp: <number> }`.
4. Confirm every event has the expected `app_release`, `app_dist`, `app_variant` super-properties (set in `lib/analytics.ts`).
5. Spot-check that no event payload contains `email`, `name`, or `phone` anywhere in PostHog's JSON view.
