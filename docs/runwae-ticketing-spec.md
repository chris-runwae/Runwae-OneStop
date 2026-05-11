# Runwae Ticketing — Phase B (hot release) + Phase C (expansion)

## Context

When a host creates an event in `apps/hosts` and selects "Runwae ticketing,"
the option is wired into `events.ticketingMode` but **no ticketing fields
are exposed in the UI**. The `event_ticket_tiers` table, ticket issuance,
Stripe Checkout, host commission split, and Stripe Connect payouts are all
already implemented on the backend — the path is unreachable from the host
app today.

The goal is to ship a usable Runwae-ticketed event end-to-end (Phase B),
then expand into self-serve refunds, multi-tier pricing, QR check-in,
scheduled reminders, and mobile purchase (Phase C).

We are deliberately **splitting into two releases** so the hot release is
small enough to test with real hosts. Phase C will not start until Phase B
is shipped, has bookings flowing, and at least one refund cycle has been
exercised against Stripe.

## Decisions locked from brainstorming

- **Phase B refund model: host-issued only (Option 1).** Buyer asks the
  host out-of-band; host clicks Refund in the host app. Modeled after Tito
  and Patreon. No buyer-facing refund UI in B.
- **Phase C refund model: self-serve with policy window (Option 3).**
  Modeled after Airbnb / Booking.com cancellation policies. Late requests
  fall back to a host-approval queue.
- **Commission on refund: returned in full** (Runwae's 5% is given back to
  the buyer). Simpler accounting, matches buyer expectation. Flag for
  review during implementation if finance wants a non-refundable platform
  fee.
- **Single-tier in B, multi-tier in C.** Backend already requires a tier
  row, so B writes one `event_ticket_tiers` row per event behind the
  scenes (name "General Admission", `maxPerOrder` defaulted to 8, no sale
  window). C exposes the full tier editor.
- **"My Tickets" extends `/bookings`** rather than introducing a new
  route. A ticket purchase already creates a `bookings` row of type
  `event_ticket` — the existing page just needs a ticket-aware view.

## Critical files (read these before implementing)

- `packages/convex/convex/_generated/ai/guidelines.md` — Convex API rules.
  Per project CLAUDE.md, **read this first** before any Convex code.
- `packages/convex/convex/schema.ts:515–596, 655–703` — events,
  `event_ticket_tiers`, `event_tickets`, bookings, commissions.
- `packages/convex/convex/host/events.ts:83–214` — `createEvent`,
  `updateEvent` mutations (need new tier args).
- `packages/convex/convex/bookings.ts:20, 156–230, 472–487` — commission
  constant, `createTicketBooking`, `confirmByStripeSession`.
- `apps/hosts/components/events/event-form.tsx:374–411` — ticketing mode
  picker; the UI gap lives here.
- `apps/web/app/(app)/events/[slug]/EventDetailClient.tsx:537–695` —
  attendee paid checkout (already works).
- `apps/web/app/api/webhooks/stripe/route.ts` — webhook handler (needs
  `charge.refunded` case in B).
- `apps/web/app/(app)/bookings/` — existing page to extend.
- `packages/convex/convex/lib/email.ts` — Resend templates pattern.
- `packages/convex/convex/notifications.ts:22–37, 42` — `insertNotification`
  and `_fanOut` for in-app + push.

---

## Phase B — Hot Release

Scope: a host can create a Runwae-ticketed event with price + currency +
capacity, a buyer can purchase, a buyer can see their tickets, a host can
issue a refund. That is the entire surface area of B.

### B1 — Schema additions (`packages/convex/convex/schema.ts`)

- `bookings.status`: extend the union to include `"refunded"`.
- `bookings`: add optional fields `refundedAt: v.number()`,
  `refundedAmount: v.number()`, `stripeRefundId: v.string()`,
  `refundReason: v.string()`.
- `event_tickets.status`: already supports `"cancelled"`; we'll reuse it
  for refunded tickets and add `refundedAt: v.optional(v.number())`.
- `commissions.status`: extend the union to include `"reversed"` (used by
  B4 when a confirmed booking is refunded before payout).

Adding new literals to a `v.union` is a schema-narrowing change for any
existing rows. Use the `convex-migration-helper` skill / pattern: add the
literal first, deploy, then start writing rows with the new value. No
backfill needed (no existing rows have status `refunded` or `reversed`).

### B2 — Host UI: ticket fields for Runwae mode

Edit `apps/hosts/components/events/event-form.tsx:396–411`. When
`ticketingMode === "runwae"`, render:

- `price` — number input, required, min 0.50, label "Ticket price"
- `currency` — Select with `["GBP", "USD", "EUR"]`, default GBP (matches
  Convex `crons.refreshRates` base currency)
- `capacity` — number input, required, integer, min 1, label "Total
  tickets available"

These three fields map to a single `event_ticket_tiers` row. The host
never sees the word "tier" in B.

### B3 — Host event mutations write the tier

Edit `packages/convex/convex/host/events.ts:83–214`:

- `createEvent` accepts new optional args `price`, `currency`, `capacity`
  (all required when `ticketingMode === "runwae"` — validate in handler,
  not in the optional union).
- After inserting the event, when `ticketingMode === "runwae"`, insert one
  `event_ticket_tiers` row: `{ eventId, name: "General Admission", price,
  currency, quantity: capacity, quantitySold: 0, maxPerOrder: 8, isVisible:
  true, sortOrder: 0 }`.
- `updateEvent` updates the matching tier row when those fields change.
  Reject `capacity` changes that would push below `quantitySold`.

### B4 — Refund mutation (`packages/convex/convex/bookings.ts`)

Add `refundTicketBooking` mutation:

- Args: `bookingId`, `reason` (string).
- Auth: caller must be the event's host (look up via
  `events.hostId`).
- Validate: booking type is `event_ticket`, status is `confirmed`.
- Call Stripe `refunds.create` via a Convex Action (Stripe SDK is not
  available in mutations). Pattern: mutation marks booking
  `refund_requested`, schedules the action; action calls Stripe and on
  success calls `confirmRefund` internal mutation.
- On confirm: set `bookings.status = "refunded"`, populate `refundedAt`,
  `refundedAmount`, `stripeRefundId`, `refundReason`. Decrement
  `event_ticket_tiers.quantitySold` (free up capacity). Set every issued
  `event_tickets` row for this booking to `status = "cancelled"`,
  `refundedAt = now`.
- Reverse the commission: if `commissions.status === "pending"`, mark it
  `"reversed"`. If `"paid"`, log a warning and surface in the host UI
  (handle case where payout already happened — out of scope for the
  auto-refund; manual reconciliation).

### B5 — Stripe webhook: `charge.refunded`

Edit `apps/web/app/api/webhooks/stripe/route.ts`. Handle
`charge.refunded` for refunds that originate **outside** our app (e.g.,
host issues from Stripe Dashboard directly). Resolve the booking via
`charge.payment_intent`, then call the same `confirmRefund` internal
mutation. Idempotent — if the booking is already `refunded`, no-op.

### B6 — Host UI: attendees list + refund button

New page: `apps/hosts/app/events/[id]/attendees/page.tsx` (or wherever
host event detail lives — confirm during implementation by reading the
host app's existing event-detail route).

- Lists confirmed bookings for the event (from `bookings.getByEvent` —
  add this query if it doesn't exist).
- Per row: buyer name, ticket count, amount, status.
- "Issue refund" button on each `confirmed` row → confirm modal showing
  amount + "5% platform fee will also be returned to the buyer" → calls
  `bookings.refundTicketBooking` with a reason.
- Refunded rows show "Refunded" badge + refund timestamp.

### B7 — Buyer "My Tickets" view

Extend `apps/web/app/(app)/bookings/page.tsx`. Group bookings by type:
`event_ticket` rows render with event name, date, location, ticket
count, status. Click-through to `/events/[slug]` for the event. For
`refunded` rows show "Refunded on {date}" inline.

(Per-ticket QR codes are out of scope for B — they land in C. In B the
host checks attendees by name from the host app.)

### B8 — Ticket confirmation email

Add `sendTicketConfirmationEmail` to
`packages/convex/convex/lib/email.ts`, mirroring the `sendEventStatusEmail`
pattern. Triggered from `bookings.confirmByStripeSession` after the
ticket rows are inserted. Includes: event name, date, location,
ticket count, total, the buyer's `event_tickets.ticketCode` values
(plain text in B; QR comes in C).

Add `sendRefundConfirmationEmail` triggered from `confirmRefund`.

### B9 — Verification (end-to-end smoke test)

1. `pnpm install` at repo root.
2. `cd packages/convex && pnpm dev` (terminal 1).
3. `cd apps/hosts && pnpm dev` (terminal 2). `cd apps/web && pnpm dev`
   (terminal 3).
4. As a host: create event with Runwae ticketing, price £25, capacity 10.
5. As a buyer (separate browser): open event, buy 2 tickets via Stripe
   Checkout in test mode. Confirm webhook fires:
   `npx convex logs` should show `confirmByStripeSession`. Confirmation
   email arrives via Resend.
6. Buyer's `/bookings` page shows the new ticket booking.
7. As host: view attendees, click Refund on the booking, confirm.
   Verify: booking flips to `refunded`, tier `quantitySold` drops to 0,
   buyer's `/bookings` shows refunded state, refund email arrives.
8. From Stripe Dashboard: refund a separate test purchase manually.
   Verify the `charge.refunded` webhook path produces the same result.
9. `cd packages/convex && npx convex dev --once --typecheck=enable` —
   must exit 0.

Phase B is shipped when all 9 steps pass against the dev Convex
deployment, plus a manual review of the host UI on a fresh event.

---

## Phase C — Planned Expansion

Do not start C until B has been in production for at least one full event
cycle (event published → tickets sold → at least one refund issued →
event date passed). The signal to start C is: hosts are asking for
self-serve refunds, multi-tier pricing, or door check-in.

### C1 — Self-serve refund window (Airbnb pattern)

- New `events.refundPolicy` field: union of `"none" | "anytime" |
  "until_24h" | "until_48h" | "until_7d" | "custom_cutoff"` plus an
  optional `events.refundCutoffAt: v.number()` for custom.
- Host event form: dropdown to set policy at creation/edit. Display the
  policy as a badge on the public event page (`/e/[slug]` and
  `/events/[slug]`).
- Buyer "My Tickets": if `now < cutoff`, show "Refund this ticket"
  button. Click → confirm modal → call new `bookings.selfRefund`
  mutation, which checks the cutoff server-side and reuses B4's refund
  pipeline. If `now >= cutoff`, button changes to "Request refund" and
  routes to C2.
- Cutoff math uses event's `timezone` field (per project CLAUDE.md —
  never hardcode timezone).

### C2 — Late-request queue (fallback for after-cutoff)

- New `refund_requests` table: `bookingId`, `userId`, `eventId`,
  `reason`, `status` (`pending|approved|denied`), `decidedAt`,
  `decidedBy` (host userId), `decisionReason`, `createdAt`.
- Buyer-side request form on My Tickets after cutoff. Submitting fires
  `notifications._fanOut` to the host with type `"refund_requested"`
  (add to notification type union).
- Host inbox: new screen `apps/hosts/app/refund-requests/page.tsx`
  listing pending requests. Approve → calls B4 pipeline. Deny → updates
  request status, fires `"refund_decision"` notification + email to
  buyer with reason.

### C3 — Multi-tier UI (Eventbrite pattern)

- Replace the single price/currency/capacity inputs in the host form
  with a tier editor: add row, edit row, delete row, reorder. Per row:
  name, price, currency, capacity, sale start/end (optional), max per
  order (optional).
- Backend: `host/events.ts` accepts `tiers: v.array(...)` instead of
  scalar fields. CRUD over `event_ticket_tiers` reconciles the array.
- Validation: cannot delete a tier with `quantitySold > 0`; cannot drop
  capacity below `quantitySold`.
- Existing single-tier events (B-era) auto-render in the editor as a
  one-row tier list — no migration needed because the data model is
  already correct.
- Public event page: tier picker UI already exists at
  `EventDetailClient.tsx:537–695` for paid checkout — wire it to surface
  multiple tiers (it's currently single-tier in practice because B only
  creates one row).

### C4 — QR codes + door check-in

- On ticket issuance (`bookings.confirmByStripeSession`): generate a QR
  payload encoding `ticketCode` + a signed HMAC of `(ticketCode,
  eventId)` so codes can't be forged. Store the HMAC alongside the
  ticket — verify on scan.
- Email update (B8 template): include QR image inline (Resend supports
  attachments / inline data URIs).
- "My Tickets" page: render QR per ticket.
- New host scanner screen: `apps/hosts/app/events/[id]/scan/page.tsx`.
  Use `@zxing/browser` (or similar) for camera-based QR scanning. On
  scan, call `events.checkInTicket` mutation: validates HMAC, sets
  `event_tickets.checkedInAt = now`, returns the buyer name + ticket
  status. Reject already-used tickets and refunded tickets clearly.
- Manual fallback: search-by-name + tap-to-check-in for hosts without a
  camera or for offline-recovery.

### C5 — Scheduled event reminders

- Convex cron job (extend `crons.ts`): every hour, find events starting
  in 24h and 1h windows that have confirmed ticket holders. For each
  ticket holder, call `notifications._fanOut` with type
  `"event_reminder"` (already in the schema).
- Idempotency: track sent reminders per (eventId, userId, window) in a
  small `event_reminders_sent` table to avoid double-firing across cron
  runs.
- Email + push.

### C6 — Mobile event purchase flow (`apps/mobile`)

- New screens under `apps/mobile/screens/events/`: list, detail,
  checkout, my tickets, ticket QR.
- Reuse the existing Stripe Payment Sheet wiring referenced in
  `bookings.ts:489–503`.
- Authentication, currency display, and timezone all follow the
  existing mobile app's patterns — read those before implementing.

### C7 — Verification

Each C-feature gets its own end-to-end verification mirroring B9 for the
relevant code path. Self-refund: book → wait until inside the window →
self-refund → verify tier capacity restored. Late request: book → set
event cutoff to past → request refund → host approves from inbox →
verify same end state as B4. Multi-tier: create event with 3 tiers, buy
across 2 tiers, refund one, verify per-tier `quantitySold` updates.
QR: scan a valid ticket twice, verify second scan rejects. Reminders:
manually trigger the cron and verify notifications + emails fire once
per window. Mobile: full purchase + check-in cycle on iOS simulator.

---

## Open items for implementer to flag back

These are calls I made with reasonable defaults but flag for confirmation
during execution rather than guessing later:

1. **Refund commission policy** — currently "Runwae returns its 5% with
   the refund." Confirm with finance before B4. If non-refundable, the
   buyer sees `grossAmount - commissionAmount` returned and we keep the
   commission row as `paid`.
2. **Currency list for B** — `["GBP", "USD", "EUR"]` is a starting set.
   Add others if the early host roster includes hosts in other regions.
3. **Host attendees list location** — placed at
   `apps/hosts/app/events/[id]/attendees/page.tsx` but the host app's
   actual event-detail route should be confirmed by reading
   `apps/hosts/app/events/[id]/` first.
4. **Per-event capacity vs per-tier capacity** — B treats these as the
   same number (one tier). C exposes them as per-tier with no event-level
   cap. If hosts want a venue-level cap that overrides the sum of tiers,
   that's a separate field on `events` and we should add it to C3.
