# Phase 2 Quick Wins + Phase 1 Audits + Phase 3 Native Bits

## Context

Punch list to clear a batch of small bug-fixes, audit groundwork and native
build hardening ahead of the next release. Most items are JS-only (shippable
via EAS Update / OTA); a small Phase 3 sub-list touches `app.config.ts` /
`eas.json` and therefore needs a fresh `eas build`.

The objective for this pass is to get every JS fix testable in a dev build by
the end of the session, leave an audit query the user can run by hand, and
land the Phase 3 config changes ready for the next build.

## Pre-flight: what's already done

While exploring I found a few items the punch list flags as TODO but that
are already in tree:

- `expo-apple-authentication` plugin is in `apps/mobile/app.config.ts:176`.
- Apple credential revoke listener exists at
  `apps/mobile/hooks/useAppleCredentialsRevoke.ts` and is mounted in
  `apps/mobile/app/_layout.tsx:99`.
- iOS `NSLocationWhenInUseUsageDescription` is set in `app.config.ts:77`.
- Android coarse + fine location permissions are listed in
  `app.config.ts:127-129` (expo-maps plugin handles the runtime prompt).

Those four sub-items collapse from "do" to "verify only" — the spec calls
them out below but doesn't re-implement them.

## Out of scope (needs user action, not code)

- **Rotate `SENTRY_AUTH_TOKEN`** — only the user can rotate in Sentry and
  push the new value via `eas secret:create --name SENTRY_AUTH_TOKEN`.
  `eas.json` already references it as `$SENTRY_AUTH_TOKEN` in `preview` and
  `production` profiles. This spec includes the runbook but not the rotation.
- **Run the commissions-table sweep query** — spec ships a script the user
  invokes from the Convex dashboard / CLI; the spec does not run it.

---

## C8 — Commission split-pct semantic bug + Vitest test

**File:** `packages/convex/convex/commissions.ts:16`
**Status:** real bug, but the affected function (`recordForBooking`) has **zero callers** in the current tree.

### Finding

```ts
const hostShare = Math.round(args.totalCommission * (args.splitPct / 100));
const runwaeShare = args.totalCommission - hostShare;
```

The math reads "`splitPct` is the host's share of the commission, as a whole-number percentage (70 → 70%)". But every site that touches `splitPct` elsewhere in the codebase uses the field to record the **platform commission rate** — the cut Runwae takes off the booking, not the host's slice of that cut:

- `bookings.ts:24` — `PLATFORM_TICKET_COMMISSION_PCT = 5; // 5% Runwae cut`
- `bookings.ts:322` — flight: `splitPct: 3` with `hostShare: 0, runwaeShare: booking.commissionAmount`
- `bookings.ts:474` — event: `splitPct: PLATFORM_TICKET_COMMISSION_PCT` (5)
- `bookings.ts:565` — hotel: `splitPct: 10` with `hostShare: 0`

So the field is **semantically overloaded**: in `recordForBooking` it means "host's % of commission"; everywhere else it means "platform commission rate on the booking total". A future engineer wiring `recordForBooking` would almost certainly pass `5` or `10` (platform rate) and end up paying hosts 5–10% of the commission instead of 90–95%.

### Fix

1. Rename the argument in `recordForBooking` from `splitPct` to `hostSharePct` and add a JSDoc that anchors the semantic ("integer percent, 0–100, of `totalCommission` that goes to the host").
2. Add a runtime guard: `if (args.hostSharePct < 0 || args.hostSharePct > 100) throw new Error(...)`.
3. Store the rename in the row but keep the schema field name `splitPct` (no migration needed) by writing `splitPct: args.hostSharePct`. Add a `// stored as host share %` comment at `commissions.ts:25`.
4. Decide host-share-pct vs platform-rate-pct convention for the table going forward — the audit (Phase 1) will surface which rows used which convention.

### Vitest test

Add `packages/convex/convex/commissions.test.ts` — uses `convex-test` (already a devDep at `packages/convex/package.json:devDependencies`). Tests:

- `recordForBooking` with `totalCommission: 1000, hostSharePct: 70` ⇒ `hostShare = 700, runwaeShare = 300`.
- `recordForBooking` with `totalCommission: 1, hostSharePct: 50` ⇒ `hostShare = 1, runwaeShare = 0` (Math.round behaviour at the boundary).
- `recordForBooking` with `hostSharePct: 0` ⇒ runwae keeps 100%.
- `recordForBooking` with `hostSharePct: 100` ⇒ host gets 100%.
- Out-of-range `hostSharePct` throws.

Run with `cd packages/convex && pnpm test`.

---

## C3 — Hotel payment screen currency formatting

**File:** `apps/mobile/app/hotel/payment.tsx`

The summary card at line 209-215 already uses `Intl.NumberFormat`. The bug is the **CTA button text** at line 334:

```tsx
<Text style={styles.payBtnText}>
  Pay {currency} {price.toFixed(0)}
</Text>
```

That renders as `Pay GBP 250` — no symbol, no locale, ignores `maximumFractionDigits`.

### Fix

Hoist the price label into a const at the top of the component (mirroring what `flights/book/payment.tsx:105-109` already does):

```ts
const priceLabel = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: currency || 'GBP',
  maximumFractionDigits: 0,
}).format(price);
```

Use `priceLabel` in both the summary card (line 209) and the CTA (line 334: `Pay {priceLabel}`). Removes duplication and fixes the bug.

---

## H1 — Home pull-to-refresh

**Files:**
- `apps/mobile/hooks/useExploreData.ts:128-133`
- `apps/mobile/app/(tabs)/index.tsx` (consumer — no change required)

### Finding

The stub is in `useExploreData`, not the screen. `refresh()` is literally:

```ts
const refresh = async () => {
  setRefreshing(true);
  // Convex auto-invalidates; nothing to do. Toggle the flag so the
  // RefreshControl spinner cycles instead of getting stuck.
  setTimeout(() => setRefreshing(false), 600);
};
```

A 600 ms fake. The accompanying comment is correct that `useQuery` subscriptions are reactive — but the user wants a real server-side refetch, not a "trust me" timer.

### Fix

Use Convex's imperative one-shot fetch (`useConvex().query(...)`) to round-trip every featured list. The reactive `useQuery` subscriptions still drive the rendered data, but the imperative fetch gives `refresh()` real work to await and surfaces real errors:

```ts
import { useConvex } from 'convex/react';

const convex = useConvex();
const refresh = async () => {
  setRefreshing(true);
  try {
    await Promise.all([
      convex.query(api.destinations.list, {}),
      convex.query(api.events.listPublished, {}),
      convex.query(api.experiences.listFeatured, {}),
      convex.query(api.itinerary.listTemplates, {}),
    ]);
  } finally {
    setRefreshing(false);
  }
};
```

No changes to `(tabs)/index.tsx` — it already calls `refreshExplore()`. The screen's image-prefetch step also stays.

---

## H6 — User-facing payment-error UI (hotel + flight)

**Files:**
- `apps/mobile/app/hotel/payment.tsx` — currently uses `Alert.alert('Payment failed', …)` on line 122 and line 156.
- `apps/mobile/app/flights/book/payment.tsx` — same pattern on line 71 and line 99.

`Alert.alert` is jarring on iOS and drops the message as soon as the user taps OK. A dedicated inline banner stays put, doesn't block scroll, and matches the existing `initError` rendering at hotel/payment.tsx:309-312.

### Fix

Introduce a small shared component `apps/mobile/components/payment/PaymentErrorBanner.tsx`:

```tsx
type Props = { message: string; onDismiss: () => void };
```

- Pink (#FF1F8C) border, light-pink (#FFF1F8) fill, dark-mode variants matching `TravelConnector.tsx` pill.
- Renders inside the sticky CTA, above the Pay button, when set.
- Dismiss "X" clears state.

Wire it into both `payment.tsx` files:

1. Add `const [payError, setPayError] = useState<string | null>(null)` to each.
2. Replace `Alert.alert('Payment failed', msg)` with `setPayError(msg)`.
3. Keep `Alert.alert('Missing info', …)` for the form-validation case — that's still appropriate (modal blocks until user fixes input).
4. Clear `payError` when the user taps Pay again (start of `handlePay`).

Both screens get the banner; both keep their existing `initError` block (which sits below the Pay button and means "Stripe never finished initialising"). Two error surfaces, two distinct meanings — `initError` is fatal, `payError` is retryable.

---

## Phase 1 audit groundwork

### Commissions table sweep for 100x-inflated rows

Add `packages/convex/convex/admin/auditCommissions.ts` — a `query` (admin-only via `requireAdmin(ctx)` helper that already exists in `admin/`) that returns:

- Rows where `hostShare + runwaeShare !== totalCommission` (math drifted)
- Rows where `splitPct > 100` (basis-points contamination)
- Rows where `hostShare > totalCommission` (impossible)
- Rows where `runwaeShare > totalCommission * 100` (the 100x case)
- Sorted by `createdAt` desc, capped at 500 rows.

User runs from the Convex dashboard: `runQuery(api.admin.auditCommissions.scan, { hours: 720 })` (last 30 days).

This is **read-only** — no automatic remediation. Spec stops here; user reviews output and decides whether to backfill / refund.

### Email verification smoke test

Tracked in `auth.ts:78` (`email-verification-otp` provider). Smoke-test plan, **not** an automated test:

1. Sign up with a fresh email in dev build.
2. Confirm Resend sends the OTP (check Resend logs).
3. Enter the OTP — confirm `users.emailVerificationTime` is set.
4. Block-list re-use: enter the same OTP twice; second attempt fails.
5. Wrong OTP returns a user-readable error (not "Internal Server Error").

Drop this as `docs/smoke-tests/email-verification.md` so it's reviewable in PRs and rerunable each release.

### Rotate `SENTRY_AUTH_TOKEN` (user runbook only)

Documented in the spec, not implemented. Steps:

1. Sentry → Settings → Auth Tokens → Revoke current → Generate new (scopes: `project:releases`, `org:read`).
2. `eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value <new>` (or `eas secret:push` if it already exists).
3. Confirm `eas.json` lines 29 + 45 still reference `$SENTRY_AUTH_TOKEN` (yes — verified).
4. Rebuild preview to verify uploads succeed.

---

## Phase 3 — native build config

### Android Play Store submit profile — deferred

Per user direction, leaving `eas.json` submit.production iOS-only for now.
Will revisit when the service-account JSON is ready.

### Location permission strings — verify only

`app.config.ts` already has:
- iOS: `NSLocationWhenInUseUsageDescription` (line 77).
- Android: `ACCESS_COARSE_LOCATION` + `ACCESS_FINE_LOCATION` (lines 127-129).
- expo-maps plugin: `requestLocationPermission: true` + matching string (lines 162-169).

This spec verifies the strings are consistent; **no edits needed** unless App Review has previously rejected the wording. Spec records this as ✅.

### expo-apple-authentication + revoke listener — verify only

Both done. Spec records as ✅. Will sanity-check the listener with the user once they're in the dev build (revoke from Settings → app should drop to sign-in on next foreground).

---

## Execution order

Implement in this order so the user can OTA-test the JS items as soon as they land:

1. C8 fix + Vitest test (`packages/convex/`).
2. C3 currency fix (`apps/mobile/app/hotel/payment.tsx`).
3. H6 error banner component + hook into both payment screens.
4. H1 refresh fix in `useExploreData.ts`.
5. Phase 1 audit query + smoke-test doc.
6. Sentry runbook — `docs/runbooks/sentry-token-rotation.md`.

After step 4, push an EAS Update; user can test C3 / H6 / H1 immediately. After step 5, run the audit query.

## Critical files

| Path | Touched |
|------|---------|
| `packages/convex/convex/commissions.ts` | rename arg, add guard |
| `packages/convex/convex/commissions.test.ts` | new — Vitest |
| `packages/convex/convex/admin/auditCommissions.ts` | new |
| `apps/mobile/app/hotel/payment.tsx` | currency fix + error banner wiring |
| `apps/mobile/app/flights/book/payment.tsx` | error banner wiring |
| `apps/mobile/components/payment/PaymentErrorBanner.tsx` | new |
| `apps/mobile/hooks/useExploreData.ts` | replace stub `refresh()` with imperative `convex.query` round-trip |
| `docs/smoke-tests/email-verification.md` | new |
| `docs/runbooks/sentry-token-rotation.md` | new |

## Verification

- **C8:** `cd packages/convex && pnpm test` — all five test cases pass.
- **C8 typecheck:** `cd packages/convex && npx convex dev --once --typecheck=enable` returns exit 0.
- **C3:** In dev build, navigate to a hotel booking → payment screen. CTA reads e.g. "Pay £250" not "Pay GBP 250". Summary card unchanged.
- **H6:** In dev build, present payment sheet, decline the card → banner appears inline, doesn't block scroll, dismiss "X" clears it. Confirm modal still fires for missing first/last/email.
- **H1:** Pull down to refresh on home screen; throttle the network and verify the imperative `convex.query` round-trips fire (Sentry / network tab) — spinner should stay until they resolve, not 600 ms flat.
- **Audit query:** Run `npx convex run admin:auditCommissions:scan '{"hours":720}'` from `packages/convex/`. Verify the script returns row-counts in each bucket.
- **Phase 3 Android:** `eas submit --profile production --platform android --dry-run` (once the credentials are wired).
